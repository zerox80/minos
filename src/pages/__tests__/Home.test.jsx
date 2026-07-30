import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Home from '../Home'
import { api } from '../../api/client'

vi.mock('../../api/client', () => ({
  api: {
    listPublishedPages: vi.fn(),
    getPublishedPage: vi.fn(),
  },
}))

vi.mock('../../components/dynamic-page/PostCard', () => ({
  default: ({ post }) => <article>{post.title}</article>,
}))

const renderHome = () =>
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>,
  )

describe('Home', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    api.listPublishedPages.mockResolvedValue([])
  })

  it('loads posts using the slug array returned by the public API', async () => {
    api.listPublishedPages.mockResolvedValue(['security'])
    api.getPublishedPage.mockResolvedValue({
      page: { title: 'Security' },
      posts: [{ id: 'post-1', title: 'Secure defaults', created_at: '2026-01-01T00:00:00Z' }],
    })

    renderHome()

    expect(await screen.findByText('Secure defaults')).toBeInTheDocument()
    expect(api.getPublishedPage).toHaveBeenCalledWith('security')
  })

  it('merges existing posts from every published legacy page into one feed', async () => {
    api.listPublishedPages.mockResolvedValue(['projekte', 'notizen'])
    api.getPublishedPage.mockImplementation(async (slug) => ({
      posts:
        slug === 'projekte'
          ? [{ id: 'post-1', title: 'Bestehendes Projekt', created_at: '2025-01-01T00:00:00Z' }]
          : [{ id: 'post-2', title: 'Bestehende Notiz', created_at: '2025-02-01T00:00:00Z' }],
    }))

    renderHome()

    expect(await screen.findByText('Bestehendes Projekt')).toBeInTheDocument()
    expect(screen.getByText('Bestehende Notiz')).toBeInTheDocument()
    expect(api.getPublishedPage).toHaveBeenCalledWith('projekte')
    expect(api.getPublishedPage).toHaveBeenCalledWith('notizen')
  })

  it('renders only published blog article cards', async () => {
    api.listPublishedPages.mockResolvedValue(['blog'])
    api.getPublishedPage.mockResolvedValue({
      posts: [{ id: 'post-1', title: 'Nur dieser Artikel', created_at: '2026-01-01T00:00:00Z' }],
    })

    renderHome()

    expect(await screen.findByText('Nur dieser Artikel')).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(1)
  })
})
