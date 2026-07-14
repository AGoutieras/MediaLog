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
import EntryDetailModal from './EntryDetailModal'
import { useAuth } from '../context/AuthContext'
import EntryModal from './EntryModal'
import API_URL from '../config.js'

/**
 * MediaGrid Component
 * Renders the dashboard's main content: one section per status (In Progress, Planned, Done).
 * Each section has a + button (opens QuickAddModal) and a sort dropdown.
 * Clicking a tile opens EntryDetailModal; clicking Edit inside it opens EntryModal.
 *
 * Receives filtered entries from DashboardPage, filtering by status and type
 * is handled upstream, MediaGrid only handles grouping and sorting.
 */
export default function MediaGrid({ entries, statusFilter, refetch }) {
  // If a specific status is selected in FilterBar, show only that section
  const allStatuses = ['In Progress', 'Planned', 'Done']
  const statuses = statusFilter === 'all' ? allStatuses : [statusFilter]

  const [openModalStatus, setOpenModalStatus] = useState(null)
  // sortBy is an object keyed by status so each section has its own independant sort
  const [sortBy, setSortBy] = useState({})
  const [openSortStatus, setOpenSortStatus] = useState(null)
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const { token } = useAuth()

  // Pure sort function, does not mutate the original array
  function sortItems(items, sort) {
    const sorted = [...items]
    if (sort === 'date_desc')
      return sorted.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      )
    if (sort === 'date_asc')
      return sorted.sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      )
    if (sort === 'az')
      return sorted.sort((a, b) => a.title.localeCompare(b.title))
    if (sort === 'za')
      return sorted.sort((a, b) => b.title.localeCompare(a.title))
    if (sort === 'rating_desc')
      return sorted.sort((a, b) => b.rating - a.rating)
    if (sort === 'rating_asc') return sorted.sort((a, b) => a.rating - b.rating)
    return sorted
  }

  async function handleDelete(entryId) {
    try {
      await fetch(`${API_URL}/entries/${entryId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      // Refetch entries from the parent to update the grid without a full page reload
      refetch()
      setSelectedEntry(null)
    } catch (err) {
      console.error(err)
    }
  }

  function handleEdit() {
    console.log(selectedEntry)
    setIsEditModalOpen(true)
  }

  async function handleUpdateEntry(fields) {
    try {
      await fetch(`${API_URL}/entries/${selectedEntry.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          // Status is preserved from the existing entry, not editable from this modal
          status: selectedEntry.status,
          note: fields.note,
          rating: fields.rating,
          platform: fields.platform,
          start_date: fields.start_date,
          end_date: fields.end_date,
          watched_before: fields.watched_before,
          completion_percentage: fields.completion_percentage,
          playtime_hours: fields.playtime_hours,
        }),
      })
      refetch()
      setIsEditModalOpen(false)
      setSelectedEntry(null)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div>
      {statuses.map(status => {
        const items = entries.filter(e => e.status === status)
        const currentSort = sortBy[status] || 'date_desc'
        const sortedItems = sortItems(items, currentSort)

        // Rating sort is only available for Done entries (other statuses have no rating)
        const sortOptions =
          status === 'Done'
            ? [
                {
                  value: 'date_desc',
                  label: 'Date added',
                  icon: CalendarArrowDown,
                },
                {
                  value: 'date_asc',
                  label: 'Date added',
                  icon: CalendarArrowUp,
                },
                { value: 'az', label: 'Title A-Z', icon: ArrowDownAZ },
                { value: 'za', label: 'Title Z-A', icon: ArrowUpAZ },
                {
                  value: 'rating_desc',
                  label: 'Personal rating',
                  icon: ArrowDown01,
                },
                {
                  value: 'rating_asc',
                  label: 'Personal rating',
                  icon: ArrowUp01,
                },
              ]
            : [
                {
                  value: 'date_desc',
                  label: 'Date added',
                  icon: CalendarArrowDown,
                },
                {
                  value: 'date_asc',
                  label: 'Date added',
                  icon: CalendarArrowUp,
                },
                { value: 'az', label: 'Title A-Z', icon: ArrowDownAZ },
                { value: 'za', label: 'Title Z-A', icon: ArrowUpAZ },
              ]

        return (
          <div key={status} className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-text-muted mb-2">{status}</p>
              {/* + button always visible even when section is empty, allows adding to any status */}
              <button
                onClick={() => setOpenModalStatus(status)}
                className="text-text-muted hover:text-white cursor-pointer mb-1.5"
              >
                <Plus size={20} />
              </button>

              {/* Sort dropdown - clipPath animation, state scoped per section */}
              <div className="relative ml-auto">
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-text-primary select-none">
                    Sort by:
                  </span>
                  <button
                    onClick={() =>
                      setOpenSortStatus(
                        openSortStatus === status ? null : status
                      )
                    }
                    className="text-text-muted hover:text-white cursor-pointer flex items-center gap-1"
                  >
                    {sortOptions.find(opt => opt.value === currentSort)
                      ?.label || 'Date added'}
                    {(() => {
                      const CurrentIcon = sortOptions.find(
                        opt => opt.value === currentSort
                      )?.icon
                      return CurrentIcon ? <CurrentIcon size={14} /> : null
                    })()}
                  </button>
                </div>

                <div
                  className="absolute right-0 top-full w-44 overflow-hidden transition-all duration-100 z-10"
                  style={{
                    clipPath:
                      openSortStatus === status
                        ? 'inset(0 0 0 0)'
                        : 'inset(0 0 100% 0)',
                  }}
                >
                  <div className="bg-surface border border-border-strong rounded-md mt-1">
                    {sortOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setSortBy({ ...sortBy, [status]: opt.value })
                          setOpenSortStatus(null)
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-text-secondary hover:bg-surface-2 cursor-pointer flex items-center gap-2"
                      >
                        <opt.icon size={14} />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Empty state - always rendered so the + button remains accessible */}
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-text-faint">
                <p className="text-sm">No {status.toLowerCase()} entries yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {sortedItems.map(entry => (
                  <div
                    key={entry.id}
                    onClick={() => setSelectedEntry(entry)}
                    className="cursor-pointer"
                  >
                    <MediaTile entry={entry} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}

      {/* QuickAddModal opened per section via the + button */}
      {openModalStatus && (
        <QuickAddModal
          status={openModalStatus}
          onClose={() => setOpenModalStatus(null)}
          onAdded={refetch}
        />
      )}
      {/* EntryDetailModal opened by clicking a tile, closed before showing edit modal */}
      {selectedEntry && !isEditModalOpen && (
        <EntryDetailModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
          onEdit={handleEdit}
          onDelete={() => handleDelete(selectedEntry.id)}
        />
      )}

      {/* EntryModal in edit mode - initial props pre-fill all fields from the existing entry
          .slice(0, 10) converts ISO timestamps to YYYY-MM-DD for date inputs */}
      {isEditModalOpen && selectedEntry && (
        <EntryModal
          media={selectedEntry}
          selectedStatus={selectedEntry.status}
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedEntry(null)
          }}
          onAdd={handleUpdateEntry}
          initialNote={selectedEntry.note ?? ''}
          initialRating={selectedEntry.rating ?? null}
          initialPlatform={selectedEntry.platform ?? ''}
          initialStartDate={selectedEntry.start_date?.slice(0, 10) ?? ''}
          initialEndDate={selectedEntry.end_date?.slice(0, 10) ?? ''}
          initialWatchedBefore={selectedEntry.watched_before ?? false}
          initialCompletionPercentage={
            selectedEntry.completion_percentage ?? null
          }
          initialPlaytimeHours={selectedEntry.playtime_hours ?? ''}
          isEditing={true}
        />
      )}
    </div>
  )
}
