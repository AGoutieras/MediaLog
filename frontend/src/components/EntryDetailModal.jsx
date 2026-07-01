import { X, Star, EllipsisVertical, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'

export default function EntryDetailModal({ entry, onClose, onEdit, onDelete }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  function getExternalUrl(entry) {
    if (entry.media_type === 'game') {
      return entry.slug ? `https://www.igdb.com/games/${entry.slug}` : null
    }
    if (entry.media_type === 'movie') {
      return `https://www.themoviedb.org/movie/${entry.external_id}`
    }
    if (entry.media_type === 'series') {
      return `https://www.themoviedb.org/tv/${entry.external_id}`
    }
  }

  return (
    <div className="fixed inset-0 backdrop-blur-xs flex justify-center overflow-y-auto z-50 py-[25vh]">
      <div className="bg-surface border border-border-strong rounded-xl p-6 w-150 h-fit shadow-[0_34px_70px_-18px_rgba(0,0,0,0.78)]">
        {/* Header: cover + title + close button */}
        <div className="flex justify-between items-start pb-4 border-b border-border">
          <div className="flex gap-3">
            <div className="flex flex-col gap-2">
              <div className="w-20 h-28 overflow-hidden rounded-sm">
                {entry.cover_url ? (
                  <img
                    src={entry.cover_url}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-surface-3" />
                )}
              </div>
              <span
                className={`select-none rounded-md px-2 py-1 text-text-primary text-xs w-fit ${
                  entry.media_type === 'game'
                    ? 'bg-[#0070CC]'
                    : entry.media_type === 'movie'
                      ? 'bg-[#B20710]'
                      : entry.media_type === 'series'
                        ? 'bg-[#0F9D58]'
                        : 'bg-surface-3'
                }`}
              >
                {entry.media_type}
              </span>
            </div>

            <div>
              <p className="text-white font-semibold">{entry.title}</p>
              <p className="text-text-muted text-xs border border-border-strong rounded-md px-2 py-0.5 w-fit mt-1">
                {entry.year}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-text-muted hover:text-white hover:cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Platform */}
        {entry.platform && (
          <div className="py-3 border-b border-border">
            <label className="text-text-muted text-xs uppercase tracking-wide">
              Platform
            </label>
            <p className="text-text-secondary text-sm mt-1">{entry.platform}</p>
          </div>
        )}

        {/* Start date */}
        {entry.start_date && (
          <div className="py-3 border-b border-border">
            <label className="text-text-muted text-xs uppercase tracking-wide">
              {entry.media_type === 'movie' ? 'Watched on' : 'Started on'}
            </label>
            <p className="text-text-secondary text-sm mt-1">
              {new Date(entry.start_date).toLocaleDateString('fr-FR')}
            </p>
          </div>
        )}

        {/* End date - not for movies */}
        {entry.media_type !== 'movie' && entry.end_date && (
          <div className="py-3 border-b border-border">
            <label className="text-text-muted text-xs uppercase tracking-wide">
              Finished on
            </label>
            <p className="text-text-secondary text-sm mt-1">
              {new Date(entry.end_date).toLocaleDateString('fr-FR')}
            </p>
          </div>
        )}

        {/* Playtime (game) */}
        {entry.media_type === 'game' && entry.playtime_hours != null && (
          <div className="py-3 border-b border-border">
            <label className="text-text-muted text-xs uppercase tracking-wide">
              Playtime
            </label>
            <p className="text-text-secondary text-sm mt-1">
              {entry.playtime_hours} h
            </p>
          </div>
        )}

        {/* Completion percentage (game) */}
        {entry.media_type === 'game' && entry.completion_percentage != null && (
          <div className="py-3 border-b border-border">
            <label className="text-text-muted text-xs uppercase tracking-wide">
              Completion
            </label>
            <p className="text-text-secondary text-sm mt-1">
              {entry.completion_percentage}%
            </p>
          </div>
        )}

        {/* Note */}
        {entry.note && (
          <div className="py-3 border-b border-border">
            <label className="text-text-muted text-xs uppercase tracking-wide">
              Note
            </label>
            <p className="text-text-secondary text-sm mt-1">{entry.note}</p>
          </div>
        )}

        {/* Rating */}
        {entry.rating && (
          <div className="py-3 border-b border-border">
            <label className="text-text-muted text-xs uppercase tracking-wide">
              Rating
            </label>
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map(star => {
                const filled = entry.rating >= star
                const half = entry.rating >= star - 0.5 && entry.rating < star
                return (
                  <div key={star} className="relative w-4 h-4">
                    <Star
                      size={16}
                      fill="none"
                      stroke="#FFB800"
                      className="absolute"
                    />
                    {(filled || half) && (
                      <div
                        className={`absolute overflow-hidden ${half ? 'w-1/2' : 'w-full'} h-full`}
                      >
                        <Star size={16} fill="#FFB800" stroke="#FFB800" />
                      </div>
                    )}
                  </div>
                )
              })}
              <span className="text-white text-sm ml-1">
                {parseFloat(entry.rating) % 1 === 0
                  ? parseInt(entry.rating)
                  : entry.rating}
                /5
              </span>
            </div>
          </div>
        )}

        {/* Footer: external link + menu */}
        <div className="flex justify-between items-center pt-4">
          {getExternalUrl(entry) ? (
            <a
              href={getExternalUrl(entry)}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative text-accent-soft hover:text-accent-soft text-sm rounded-md px-2 py-1 border border-border-strong transition-colors duration-100"
            >
              <span>View details</span>
              <span className="absolute left-0 top-0 h-px w-0 bg-accent-soft transition-all duration-50 group-hover:w-full" />
              <span className="absolute right-0 top-0 h-0 w-px bg-accent-soft transition-all delay-100 duration-50 group-hover:h-full" />
              <span className="absolute bottom-0 right-0 h-px w-0 bg-accent-soft transition-all delay-200 duration-50 group-hover:w-full" />
              <span className="absolute bottom-0 left-0 h-0 w-px bg-accent-soft transition-all delay-300 duration-50 group-hover:h-full" />
            </a>
          ) : (
            <span />
          )}

          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-text-muted hover:text-white cursor-pointer border border-border-strong rounded-md px-1 py-1"
            >
              <EllipsisVertical size={18} />
            </button>

            <div
              className="absolute right-0 bottom-full mb-1 w-32 overflow-hidden transition-all duration-100 z-10"
              style={{
                clipPath: isMenuOpen ? 'inset(0 0 0 0)' : 'inset(100% 0 0 0)',
              }}
            >
              <div className="bg-surface-2 border border-border-strong rounded-md">
                <button
                  onClick={onEdit}
                  className="w-full text-left px-2 py-2 text-sm text-text-secondary hover:bg-surface-3 cursor-pointer flex items-center gap-2"
                >
                  <Pencil size={14} />
                  Edit
                </button>
                <button
                  onClick={onDelete}
                  className="w-full text-left px-2 py-2 text-sm text-danger hover:bg-surface-3 cursor-pointer flex items-center gap-2"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
