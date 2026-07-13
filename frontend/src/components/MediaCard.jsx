import { useNavigate } from 'react-router-dom'

/**
 * MediaCard Component
 * Displays a single search result row with cover, title, year, and media type badge.
 * The "Details" button navigates to the media detail page (/media/:type/:id).
 */
export default function MediaCard({ result }) {
  const navigate = useNavigate()

  return (
    <div
      className="flex items-center gap-4 p-4 mb-2 bg-surface border border-border-strong rounded-xl hover:border-accent transition-colors cursor-pointer"
      onClick={() =>
        navigate(`/media/${result.media_type}/${result.external_id}`)
      }
    >
      {/* Cover image — fallback to title text if no cover available */}
      <div className="text-white w-14 h-20 overflow-hidden rounded-md shrink-0">
        {result.cover_url ? (
          <img
            className="w-full h-full object-cover"
            src={result.cover_url}
            alt={`${result.title} cover`}
          />
        ) : (
          <div className="w-full h-full bg-surface-3 flex items-center justify-center text-white text-[10px] text-center px-2">
            {result.title}
          </div>
        )}
      </div>

      <div className="flex-1 text-white min-w-0">
        <div className="flex gap-2 items-center">
          <p className="truncate font-medium">{result.title}</p>
          <span
            className={`rounded-md px-2 py-1 text-xs select-none shrink-0 ${
              result.media_type === 'game'
                ? 'bg-[#0070CC]'
                : result.media_type === 'movie'
                  ? 'bg-[#B20710]'
                  : result.media_type === 'series'
                    ? 'bg-[#0F9D58]'
                    : 'bg-surface-3'
            }`}
          >
            {result.media_type}
          </span>
        </div>
        <p className="text-text-muted text-sm">{result.year}</p>
      </div>

      <span className="text-text-muted text-sm shrink-0">Details →</span>
    </div>
  )
}
