import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import PostCard from '../components/dynamic-page/PostCard'
import { api } from '../api/client'

/** Public blog feed containing published articles and no additional landing-page sections. */
const Home = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAllPosts = async () => {
      try {
        setLoading(true)
        setError(null)

        const pagesData = await api.listPublishedPages()
        const publishedPages = Array.isArray(pagesData)
          ? pagesData
          : Array.isArray(pagesData?.items)
            ? pagesData.items
            : []

        const pageRequests = publishedPages
          .map((pageReference) => ({
            slug: typeof pageReference === 'string' ? pageReference : pageReference?.slug,
          }))
          .filter(({ slug }) => Boolean(slug))
          .map(async ({ slug }) => {
            const pageData = await api.getPublishedPage(slug)
            return (pageData?.posts || []).map((post) => ({
              ...post,
              pageSlug: slug,
            }))
          })

        const settledPages = await Promise.allSettled(pageRequests)
        const allPosts = settledPages
          .filter((result) => result.status === 'fulfilled')
          .flatMap((result) => result.value)
          .sort((a, b) => {
            const dateA = new Date(a.published_at || a.created_at || 0)
            const dateB = new Date(b.published_at || b.created_at || 0)
            return dateB - dateA
          })

        setPosts(allPosts)
      } catch (err) {
        console.error('Error fetching posts:', err)
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchAllPosts()
  }, [])

  return (
    <main className="min-h-screen bg-white px-4 py-5 text-[#171713] sm:px-6 sm:py-8 lg:px-10">
      <section aria-label="Blogartikel" className="mx-auto max-w-[1240px]">
        {loading ? (
          <div
            role="status"
            className="flex min-h-[70vh] items-center justify-center gap-3 text-sm text-[#171713]/55"
          >
            <Loader2 className="h-5 w-5 animate-spin" />
            Blogartikel werden geladen …
          </div>
        ) : error ? (
          <div
            role="alert"
            className="grid min-h-[70vh] place-items-center border border-[#171713]/20 p-8 text-center"
          >
            <p className="max-w-lg text-lg">
              {error.message || 'Die Blogartikel konnten gerade nicht geladen werden.'}
            </p>
          </div>
        ) : posts.length === 0 ? (
          <div className="grid min-h-[70vh] place-items-center border border-[#171713]/20 p-8 text-center">
            <p className="text-lg">Noch keine Blogartikel veröffentlicht.</p>
          </div>
        ) : (
          <div className="grid border-l border-t border-[#171713]/25 md:grid-cols-2">
            {posts.map((post) => (
              <PostCard
                key={`${post.pageSlug}-${post.id || post.slug}`}
                post={post}
                pageSlug={post.pageSlug}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default Home
