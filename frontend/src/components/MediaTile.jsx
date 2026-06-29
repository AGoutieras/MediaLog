import { Star, SquarePen } from 'lucide-react'

export default function MediaTile({ entry }) {
  const borderColor =
    entry.media_type === 'game'
      ? 'border-[#0070CC]'
      : entry.media_type === 'movie'
        ? 'border-[#B20710]'
        : entry.media_type === 'series'
          ? 'border-[#0F9D58]'
          : 'border-border-strong'

  return (
    <div
      className={`group relative w-32 h-44 rounded-md overflow-hidden bg-surface-2 border-b-2 border-r-2 ${borderColor}`}
    >
      {/* Cover */}
      {entry.cover_url ? (
        <img
          src={entry.cover_url}
          alt={entry.title}
          className="w-full h-full object-cover transition-transform duration-100 group-hover:scale-110"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-white text-[10px] text-center px-2">
          {entry.title}
        </div>
      )}

      {/* Hover overlay with edit icon */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors duration-100">
        <SquarePen
          size={50}
          className="text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-100"
        />
      </div>

      <div className="absolute top-0 left-0 right-0 h-12 bg-linear-to-b from-black/60 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 h-10 bg-linear-to-t from-black/60 to-transparent" />

      {/* Badge Type */}
      <span
        className={`absolute top-0 left-0 rounded-br-md px-2 py-0.5 text-xs text-white flex items-center justify-center ${
          entry.media_type === 'game'
            ? 'bg-[#0070CC]'
            : entry.media_type === 'movie'
              ? 'bg-[#B20710]'
              : entry.media_type === 'series'
                ? 'bg-[#0F9D58]'
                : 'bg-border-strong'
        }`}
      >
        {entry.media_type}
      </span>

      {/* Rating */}
      {entry.rating && (
        <span className="absolute bottom-0 left-0 bg-black/40 rounded-tr-md px-2 py-0.5 text-white text-xs font-bold flex items-center gap-1">
          <Star size={12} fill="#FFB800" stroke="#FFB800" />
          {parseFloat(entry.rating) % 1 === 0
            ? parseInt(entry.rating)
            : entry.rating}
          /5
        </span>
      )}
    </div>
  )
}