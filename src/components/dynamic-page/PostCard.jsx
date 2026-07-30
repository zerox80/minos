import { Link } from 'react-router-dom'
import { ArrowRight, CalendarDays, Clock3 } from 'lucide-react'
import PropTypes from 'prop-types'
import { formatDate, normalizeSlug, buildPreviewText } from '../../utils/postUtils'

const estimateReadingTime = (text) => {
  const wordCount = String(text || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length
  return Math.max(2, Math.ceil(wordCount / 200))
}

const PostCard = ({ post, pageSlug }) => {
  const publishedDate = formatDate(post.published_at || post.created_at)
  const previewText = buildPreviewText(post)
  const postSlug = normalizeSlug(post?.slug)
  const href = postSlug ? `/posts/${pageSlug}/${postSlug}` : null

  const content = (
    <article
      className={`group flex h-full min-h-80 flex-col justify-between border-b border-r
border-[#171713]/25 bg-white p-6 transition-colors duration-200 hover:bg-[#f7f7f5]
sm:p-9`}
    >
      <div>
        <header
          className={`flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-bold uppercase
tracking-[0.08em] text-[#171713]/50`}
        >
          {publishedDate && (
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              {publishedDate}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="h-3.5 w-3.5" />
            {estimateReadingTime(post.content_markdown || previewText)} Min. Lesezeit
          </span>
        </header>

        <div className="mt-10">
          <h2
            className={`text-3xl font-bold leading-tight tracking-[-0.035em] text-[#171713]
transition-colors group-hover:text-[#44443d] sm:text-4xl`}
          >
            {post.title}
          </h2>
          {previewText && (
            <p className="mt-5 line-clamp-4 max-w-xl text-base leading-relaxed text-[#171713]/65">
              {previewText}
            </p>
          )}
        </div>
      </div>

      {href && (
        <footer className="mt-10 border-t border-[#171713]/15 pt-5">
          <span className="inline-flex items-center gap-2 text-sm font-bold">
            Artikel lesen
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </footer>
      )}
    </article>
  )

  return href ? (
    <Link
      to={href}
      aria-label={`Beitrag lesen: ${post.title}`}
      className={`block focus-visible:outline focus-visible:outline-2
focus-visible:outline-offset-[-2px] focus-visible:outline-[#171713]`}
    >
      {content}
    </Link>
  ) : (
    content
  )
}

PostCard.propTypes = {
  post: PropTypes.object.isRequired,
  pageSlug: PropTypes.string.isRequired,
}

export default PostCard
