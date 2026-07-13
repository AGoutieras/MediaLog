import { Loader2 } from 'lucide-react'

/**
 * SearchBar Component
 * Controlled search input with media type filter buttons.
 * All state (query, type, isSearching) is managed by the parent (SearchPage)
 * via props, this component only handles display and user interaction.
 * The Loader2 spinner is shown while the debounced search is in progress.
 */
export default function SearchBar({
  query,
  setQuery,
  type,
  setType,
  isSearching,
}) {
  const inputClass =
    'bg-surface border border-border-strong text-white rounded-md px-4 py-4 w-full focus:outline-none focus:border-accent'
  const filterBase =
    'text-white rounded-full px-5 py-2 transition cursor-pointer'
  return (
    <>
      <div className="relative max-w-3xl mx-auto">
        <input
          className={inputClass}
          type="text"
          maxLength="255"
          placeholder="Search games, films, series..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        {/* Spinner shown while the debounce timer is running or fetch is pending */}
        {isSearching && (
          <Loader2
            size={18}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted animate-spin"
          />
        )}
      </div>
      {/* Media type filter buttons, active button gets accent background */}
      <div className="flex max-w-5xl mx-auto gap-2 mt-3 mb-3">
        <button
          className={`${
            type === 'all'
              ? 'bg-accent hover:bg-accent-hover'
              : 'bg-surface hover:bg-surface-2'
          } ${filterBase}`}
          type="button"
          onClick={() => setType('all')}
        >
          All
        </button>
        <button
          className={`${
            type === 'game'
              ? 'bg-accent hover:bg-accent-hover'
              : 'bg-surface hover:bg-surface-2'
          } ${filterBase}`}
          type="button"
          onClick={() => setType('game')}
        >
          Games
        </button>
        <button
          className={`${
            type === 'movie'
              ? 'bg-accent hover:bg-accent-hover'
              : 'bg-surface hover:bg-surface-2'
          } ${filterBase}`}
          type="button"
          onClick={() => setType('movie')}
        >
          Films
        </button>
        <button
          className={`${
            type === 'series'
              ? 'bg-accent hover:bg-accent-hover'
              : 'bg-surface hover:bg-surface-2'
          } ${filterBase}`}
          type="button"
          onClick={() => setType('series')}
        >
          Series
        </button>
      </div>
    </>
  )
}