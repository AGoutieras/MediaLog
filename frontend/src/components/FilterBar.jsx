import { useState } from 'react'
import { Funnel, Gamepad2, Film, Tv, LayoutGrid } from 'lucide-react'

/**
 * FilterBar Component
 * Renders two independent filter axes for the dashboard:
 * - Status filter (single-select): All / In Progress / Planned / Done
 * - Type filter (multi-select): All / Games / Films / Series
 *
 * On desktop: renders as pill buttons.
 * On mobile: renders as two compact dropdowns.
 *
 * State is managed by the parent (DashboardPage) and passed down via props.
 * toggleTypeFilter handles the "All" special case and collapse logic.
 */
export default function FilterBar({
  statusFilter,
  setStatusFilter,
  typeFilters,
  toggleTypeFilter,
}) {
  const statuses = ['all', 'In Progress', 'Planned', 'Done']
  const types = ['all', 'game', 'movie', 'series']

  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false)
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false)

  const statusLabel = statusFilter === 'all' ? 'All' : statusFilter
  const typeLabel = typeFilters.includes('all')
    ? 'All'
    : typeFilters
        .map(t => (t === 'game' ? 'Games' : t === 'movie' ? 'Films' : 'Series'))
        .join(', ')

  return (
    <div className="py-4">
      {/* Desktop — pill buttons */}
      <div className="hidden sm:flex justify-between items-center">
        <div className="flex flex-wrap gap-2">
          {statuses.map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-full px-3 py-1.5 text-sm cursor-pointer transition ${
                statusFilter === status
                  ? 'bg-accent text-white'
                  : 'bg-surface text-text-muted hover:bg-surface-2'
              }`}
            >
              {status === 'all' ? 'All' : status}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {types.map(type => (
            <button
              key={type}
              onClick={() => toggleTypeFilter(type)}
              className={`rounded-full px-3 py-1.5 text-sm cursor-pointer transition ${
                typeFilters.includes(type)
                  ? 'bg-accent text-white'
                  : 'bg-surface text-text-muted hover:bg-surface-2'
              }`}
            >
              {type === 'all'
                ? 'All'
                : type === 'game'
                  ? 'Games'
                  : type === 'movie'
                    ? 'Films'
                    : 'Series'}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile — two icon buttons */}
      <div className="flex sm:hidden gap-3">
        {/* Status dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setStatusDropdownOpen(!statusDropdownOpen)
              setTypeDropdownOpen(false)
            }}
            className={`w-10 h-10 flex items-center justify-center rounded-full border cursor-pointer transition ${
              statusFilter !== 'all'
                ? 'bg-accent border-accent text-white'
                : 'bg-surface border-border-strong text-text-muted hover:text-white'
            }`}
          >
            <Funnel size={18} />
          </button>
          <div
            className="absolute left-0 top-full mt-1 w-44 overflow-hidden transition-all duration-100 z-20"
            style={{
              clipPath: statusDropdownOpen
                ? 'inset(0 0 0 0)'
                : 'inset(0 0 100% 0)',
            }}
          >
            <div className="bg-surface-2 border border-border-strong rounded-md">
              {statuses.map(status => (
                <button
                  key={status}
                  onClick={() => {
                    setStatusFilter(status)
                    setStatusDropdownOpen(false)
                  }}
                  className={`w-full text-left px-3 py-2 text-sm cursor-pointer hover:bg-surface-3 ${
                    statusFilter === status
                      ? 'text-accent-soft font-medium'
                      : 'text-text-secondary'
                  }`}
                >
                  {status === 'all' ? 'All' : status}
                </button>
              ))}
            </div>
          </div>
        </div>
        jsx{/* Type buttons — mobile */}
        <div className="flex sm:hidden gap-2 ml-auto">
          {[
            { type: 'all', icon: LayoutGrid },
            { type: 'game', icon: Gamepad2 },
            { type: 'movie', icon: Film },
            { type: 'series', icon: Tv },
          ].map(({ type, icon: Icon }) => (
            <button
              key={type}
              onClick={() => toggleTypeFilter(type)}
              className={`w-10 h-10 flex items-center justify-center rounded-full border cursor-pointer transition ${
                typeFilters.includes(type)
                  ? 'bg-accent border-accent text-white'
                  : 'bg-surface border-border-strong text-text-muted hover:text-white'
              }`}
            >
              <Icon size={18} />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
