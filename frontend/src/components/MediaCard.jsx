import { useEffect, useState } from 'react'

export default function MediaCard({ result, onAdd }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  useEffect(() => {
    if (isDropdownOpen) {
      function handleClickOutside() {
        setIsDropdownOpen(false)
      }

      document.addEventListener('click', handleClickOutside)

      return () => {
        document.removeEventListener('click', handleClickOutside)
      }
    }
  }, [isDropdownOpen])
  return (
    <>
      <div className="flex items-center mt-6 border-b border-border gap-4 py-4">
        <div className="text-white w-14 h-20 overflow-hidden rounded-sm">
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
            <p className="truncate">{result.title}</p>
            <span
              className={`rounded-md px-2 py-1 text-sm select-none ${
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
          <p className="text-text-muted">{result.year}</p>
        </div>
        <div className="relative">
          <button
            className="text-accent-soft rounded-full px-4 py-2 border border-transparent hover:border hover:border-accent transition cursor-pointer"
            type="button"
            onClick={e => {
              e.stopPropagation()
              setIsDropdownOpen(!isDropdownOpen)
            }}
          >
            + Add
          </button>
          {isDropdownOpen && (
            <div className="bg-surface border border-border-strong absolute left-full top-1/2 -translate-y-1/2 text-accent-soft ml-2 flex flex-col w-34 rounded-md">
              <button
                className="hover:bg-surface-2 py-1.5 px-4 text-left cursor-pointer"
                onClick={() => onAdd(result, 'Planned')}
              >
                Planned
              </button>
              <button
                className="hover:bg-surface-2 py-1.5 px-4 text-left cursor-pointer"
                onClick={() => onAdd(result, 'In Progress')}
              >
                In Progress
              </button>
              <button
                className="hover:bg-surface-2 py-1.5 px-4 text-left cursor-pointer"
                onClick={() => onAdd(result, 'Done')}
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
