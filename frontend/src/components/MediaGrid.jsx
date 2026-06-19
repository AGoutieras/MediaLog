import { useState } from 'react'
import MediaTile from './MediaTile'
import QuickAddModal from './QuickAddModal'
import {
  Plus,
  CalendarArrowDown,
  CalendarArrowUp,
  ArrowDownAZ,
  ArrowUpAZ,
  ArrowDown01,
  ArrowUp01,
} from 'lucide-react'

export default function MediaGrid({ entries, refetch }) {
  const statuses = ['In Progress', 'Planned', 'Done']
  const [openModalStatus, setOpenModalStatus] = useState(null)
  const [sortBy, setSortBy] = useState({})
  const [openSortStatus, setOpenSortStatus] = useState(null)

  function sortItems(items, sort) {
    const sorted = [...items]
    if (sort === 'date_desc')
      return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    if (sort === 'date_asc')
      return sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    if (sort === 'az')
      return sorted.sort((a, b) => a.title.localeCompare(b.title))
    if (sort === 'za')
      return sorted.sort((a, b) => b.title.localeCompare(a.title))
    if (sort === 'rating_desc')
      return sorted.sort((a, b) => b.rating - a.rating)
    if (sort === 'rating_asc')
      return sorted.sort((a, b) => a.rating - b.rating)
    return sorted
  }

  return (
    <div>
      {statuses.map(status => {
        const items = entries.filter(e => e.status === status)
        if (items.length === 0) return null
        const currentSort = sortBy[status] || 'date_desc'
        const sortedItems = sortItems(items, currentSort)

        const sortOptions =
          status === 'Done'
            ? [
                { value: 'date_desc', label: 'Date added', icon: CalendarArrowDown },
                { value: 'date_asc', label: 'Date added', icon: CalendarArrowUp },
                { value: 'az', label: 'Title A-Z', icon: ArrowDownAZ },
                { value: 'za', label: 'Title Z-A', icon: ArrowUpAZ },
                { value: 'rating_desc', label: 'Personal rating', icon: ArrowDown01 },
                { value: 'rating_asc', label: 'Personal rating', icon: ArrowUp01 },
              ]
            : [
                { value: 'date_desc', label: 'Date added', icon: CalendarArrowDown },
                { value: 'date_asc', label: 'Date added', icon: CalendarArrowUp },
                { value: 'az', label: 'Title A-Z', icon: ArrowDownAZ },
                { value: 'za', label: 'Title Z-A', icon: ArrowUpAZ },
              ]

        return (
          <div key={status} className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-zinc-400 mb-2">{status}</p>
              <button
                onClick={() => setOpenModalStatus(status)}
                className="text-zinc-400 hover:text-white cursor-pointer mb-1.5"
              >
                <Plus size={20} />
              </button>

              <div className="relative ml-auto">
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-zinc-200 select-none">Sort by:</span>
                  <button
                    onClick={() =>
                      setOpenSortStatus(openSortStatus === status ? null : status)
                    }
                    className="text-zinc-400 hover:text-white cursor-pointer flex items-center gap-1"
                  >
                    {sortOptions.find(opt => opt.value === currentSort)?.label || 'Date added'}
                    {(() => {
                      const CurrentIcon = sortOptions.find(opt => opt.value === currentSort)?.icon
                      return CurrentIcon ? <CurrentIcon size={14} /> : null
                    })()}
                  </button>
                </div>

                <div
                  className="absolute right-0 top-full w-44 overflow-hidden transition-all duration-100 z-10"
                  style={{
                    clipPath:
                      openSortStatus === status ? 'inset(0 0 0 0)' : 'inset(0 0 100% 0)',
                  }}
                >
                  <div className="bg-zinc-800 border border-zinc-700 rounded-md mt-1">
                    {sortOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setSortBy({ ...sortBy, [status]: opt.value })
                          setOpenSortStatus(null)
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700 cursor-pointer flex items-center gap-2"
                      >
                        <opt.icon size={14} />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-6 gap-4">
              {sortedItems.map(entry => (
                <MediaTile key={entry.id} entry={entry} />
              ))}
            </div>
          </div>
        )
      })}

      {openModalStatus && (
        <QuickAddModal
          status={openModalStatus}
          onClose={() => setOpenModalStatus(null)}
          onAdded={refetch}
        />
      )}
    </div>
  )
}