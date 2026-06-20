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
      {/* Modal card */}
      <div className="bg-zinc-800 rounded-xl p-6 w-150 h-fit">
        {/* Header: cover + title + close button */}
        <div className="flex justify-between items-start mb-4">
          {/* Cover + title */}
          <div className="flex gap-3">
            {/* Cover thumbnail + badge */}
            <div className="flex flex-col gap-2">
              <div className="w-20 h-28 overflow-hidden rounded-sm">
                {entry.cover_url ? (
                  <img
                    src={entry.cover_url}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-600" />
                )}
              </div>
              <span
                className={`select-none rounded-md px-2 py-1 text-zinc-200 text-xs w-fit ${
                  entry.media_type === 'game'
                    ? 'bg-[#0070CC]'
                    : entry.media_type === 'movie'
                      ? 'bg-[#B20710]'
                      : entry.media_type === 'series'
                        ? 'bg-[#0F9D58]'
                        : 'bg-zinc-600'
                }`}
              >
                {entry.media_type}
              </span>
            </div>

            {/* Title + year */}
            <div>
              <p className="text-white font-semibold">{entry.title}</p>
              <p className="text-zinc-400 text-xs border border-zinc-600 rounded-md px-2 py-0.5 w-fit mt-1">
                {entry.year}
              </p>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="text-zinc-400 hover:cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/*  */}
        {entry.note && (
          <p className="text-zinc-300 text-sm mt-2">{entry.note}</p>
        )}

        {/*  */}
        {entry.rating && (
          <div className="flex items-center gap-1 mt-2">
            {[1, 2, 3, 4, 5].map(star => {
              const filled = entry.rating >= star

              const half = entry.rating >= star - 0.5 && entry.rating < star

              return (
                <div key={star} className="relative w-4 h-4">
                  {/* Outline star, always visible */}
                  <Star
                    size={16}
                    fill="none"
                    stroke="#FFB800"
                    className="absolute"
                  />
                  {/* Filled star, clipped to hald or full width */}
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
            <span className="text-white text-sm ml-1">{parseFloat(entry.rating) % 1 === 0 ? parseInt(entry.rating) : entry.rating}/5</span>
          </div>
        )}
        {/* Footer: external link + menu */}
        <div className="flex justify-between items-center mt-4">
          {getExternalUrl(entry) ? (
            <a
              href={getExternalUrl(entry)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-500 hover:text-sky-400 text-sm"
            >
              View details
            </a>
          ) : (
            <span />
          )}

          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-zinc-400 hover:text-white cursor-pointer"
            >
              <EllipsisVertical size={18} />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 bottom-full mb-1 bg-zinc-700 border border-zinc-600 rounded-md w-32 z-10">
                <button
                  onClick={onEdit}
                  className="w-full text-left px-2 text-sm text-zinc-300 hover:bg-zinc-600 cursor-pointer flex items-center gap-2"
                >
                  <Pencil size={14} />
                  Edit
                </button>
                <button
                  onClick={onDelete}
                  className="w-full text-left px-2 text-sm text-red-400 hover:bg-zinc-600 cursor-pointer flex items-center gap-2"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
