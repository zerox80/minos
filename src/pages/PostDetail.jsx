import { useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { ArrowLeft, CalendarDays, Clock3, Loader2, Share2 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api/client'
import MarkdownRenderer from '../components/markdown/MarkdownRenderer'
import { formatDate } from '../utils/postUtils'

const readingTime = (content) => {
  const words = String(content || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length
  return Math.max(2, Math.ceil(words / 200))
}

/** Focused article view without global landing-page content. */
const PostDetail = () => {
  const { pageSlug, postSlug } = useParams()
  const [post, setPost] = useState(null)
  const [error, setError] = useState(null)
  const [shareLabel, setShareLabel] = useState('Teilen')

  useEffect(() => {
    const controller = new AbortController()

    const loadPost = async () => {
      try {
        setError(null)
        const data = await api.getPublishedPost(pageSlug, postSlug, {
          signal: controller.signal,
        })
        if (!controller.signal.aborted) setPost(data?.post || data)
      } catch (loadError) {
        if (!controller.signal.aborted) setError(loadError)
      }
    }

    loadPost()
    return () => controller.abort()
  }, [pageSlug, postSlug])

  const minutes = useMemo(() => readingTime(post?.content_markdown), [post?.content_markdown])

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: post.title, url: window.location.href })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        setShareLabel('Link kopiert')
        window.setTimeout(() => setShareLabel('Teilen'), 1800)
      }
    } catch (shareError) {
      if (shareError?.name !== 'AbortError') setShareLabel('Nicht möglich')
    }
  }

  if (error) {
    return (
      <main className="grid min-h-screen place-items-center bg-white px-6 text-[#171713]">
        <div className="max-w-lg text-center">
          <h1 className="text-3xl font-semibold">Dieser Blogartikel ist nicht verfügbar.</h1>
          <Link
            to="/"
            className={`mt-8 inline-flex items-center gap-2 bg-[#171713] px-6 py-3 text-sm
font-bold uppercase tracking-[0.1em] text-white`}
          >
            <ArrowLeft className="h-4 w-4" /> Alle Blogartikel
          </Link>
        </div>
      </main>
    )
  }

  if (!post) {
    return (
      <main className="grid min-h-screen place-items-center bg-white text-[#171713]">
        <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.1em]">
          <Loader2 className="h-5 w-5 animate-spin" /> Blogartikel wird geladen
        </div>
      </main>
    )
  }

  const publishedDate = formatDate(post.published_at || post.created_at)

  return (
    <main className="min-h-screen bg-white pb-20 pt-8 text-[#171713] sm:pt-12">
      <Helmet>
        <title>{post.meta?.title || post.title}</title>
        {post.excerpt && <meta name="description" content={post.excerpt} />}
      </Helmet>

      <article>
        <header className="border-b border-[#171713]/25 px-5 pb-12 sm:px-8 lg:px-12 lg:pb-16">
          <div className="mx-auto max-w-[1180px]">
            <Link
              to="/"
              className={`inline-flex items-center gap-2 text-xs font-bold uppercase
tracking-[0.1em] text-[#171713]/60 transition-colors hover:text-[#171713]`}
            >
              <ArrowLeft className="h-4 w-4" /> Alle Blogartikel
            </Link>

            <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-end">
              <div>
                <h1
                  className={`max-w-4xl text-[clamp(2.6rem,4.2vw,4.5rem)] font-bold
leading-[1.02] tracking-[-0.045em] text-[#171713]`}
                >
                  {post.title}
                </h1>
                {post.excerpt && (
                  <p className="mt-8 max-w-3xl text-xl leading-relaxed text-[#171713]/65 sm:text-2xl">
                    {post.excerpt}
                  </p>
                )}
              </div>

              <div
                className={`border-t border-[#171713]/20 pt-5 text-[11px] font-bold uppercase
tracking-[0.1em] text-[#171713]/55 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0`}
              >
                {publishedDate && (
                  <p className="flex items-center gap-2 py-2">
                    <CalendarDays className="h-4 w-4" /> {publishedDate}
                  </p>
                )}
                <p className="flex items-center gap-2 py-2">
                  <Clock3 className="h-4 w-4" /> {minutes} Min. Lesezeit
                </p>
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex items-center gap-2 py-2 transition-colors hover:text-[#171713]"
                >
                  <Share2 className="h-4 w-4" /> {shareLabel}
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
          <MarkdownRenderer
            content={post.content_markdown}
            withBreaks
            className="editorial-markdown mx-auto max-w-[780px]"
          />
        </div>
      </article>
    </main>
  )
}

export default PostDetail
