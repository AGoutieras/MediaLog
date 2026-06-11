import { useState } from 'react'

export default function EntryModal({ media, onClose, onAdd, selectedStatus }) {
  const [note, setNote] = useState('')
  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center">
      {/* Modal container */}
      <div className="bg-zinc-800 rounded-xl p-6 w-175 py">
        {/* Header: title + close button */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-white font-semibold">Add to '{selectedStatus}'</p>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex gap-4">
          {/* cover + badge */}
          <div className="w-24 shrink-0 flex flex-col gap-2">
            <div className="h-32 overflow-hidden rounded-sm">
              {media.cover_url ? (
                <img
                  className="w-full h-full object-cover"
                  src={media.cover_url}
                  alt={`${media.title} cover`}
                />
              ) : (
                <div className="w-full h-full bg-zinc-600 flex items-center justify-center text-white text-xs">
                  {media.title}
                </div>
              )}
            </div>
            <span
              className={`rounded-md px-2 py-1 text-zinc-200 text-sm w-fit ${
                media.media_type === 'game'
                  ? 'bg-purple-800'
                  : media.media_type === 'movie'
                    ? 'bg-orange-800'
                    : media.media_type === 'series'
                      ? 'bg-green-800'
                      : 'bg-zinc-600'
              }`}
            >
              {media.media_type}
            </span>
          </div>

          {/* title + year */}
          <div className="flex flex-col justify-center text-white">
            <p className="font-semibold">{media.title}</p>
            <p className="text-zinc-400 text-sm">{media.year}</p>
          </div>
        </div>
        {/* note area */}
        <textarea
          className="bg-zinc-800 border border-zinc-600 text-white rounded-md px-4 py-3 w-full focus:outline-none focus:border-zinc-500 mt-4"
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Add a note..."
        />

        {/* confirm button */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            className="bg-sky-600 hover:bg-sky-500 text-white rounded-md px-4 py-2 w-fit transition"
            onClick={() => onAdd(note)}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}
