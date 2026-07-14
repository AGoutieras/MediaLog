import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import StatsBar from '../components/StatsBar'
import MediaGrid from '../components/MediaGrid'
import FilterBar from '../components/FilterBar'
import API_URL from '../config.js'

/**
 * DashboardPage
 * Main page of the application. Fetches all user entries on mount and manages
 * the two filter axes (status and media type) at the top level.
 *
 * Filtering is done client-side on the full entries array, no separate API call
 * per filter change. fetchEntries is passed to MediaGrid as refetch so child
 * components can trigger a data refresh after add, edit, or delete.
 */
export default function DashboardPage() {
  const { token } = useAuth()
  const [entries, setEntries] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilters, setTypeFilters] = useState(['all'])

  async function fetchEntries() {
    const response = await fetch(`${API_URL}/entries`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await response.json()
    setEntries(data)
  }

  useEffect(() => {
    document.title = 'MediaLog - Dashboard'
  }, [])

  useEffect(() => {
    fetchEntries()
  }, [])

  // Both filters are applied simultaneously, entries must match both status and type
  const filteredEntries = entries.filter(entry => {
    const matchStatus = statusFilter === 'all' || entry.status === statusFilter
    const matchType =
      typeFilters.includes('all') || typeFilters.includes(entry.media_type)
    return matchStatus && matchType
  })

  function toggleTypeFilter(type) {
    // Selecting "All" resets the type filter
    if (type === 'all') {
      setTypeFilters(['all'])
      return
    }

    // Start from an empty array if "All" was previously selected
    let updated = typeFilters.includes('all') ? [] : [...typeFilters]

    if (updated.includes(type)) {
      updated = updated.filter(t => t !== type)
    } else {
      updated.push(type)
    }

    // If no type or all 3 types are selected, collapse back to "All"
    if (updated.length === 0 || updated.length === 3) {
      updated = ['all']
    }

    setTypeFilters(updated)
  }

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-8 py-8 flex flex-col gap-4">
      {/* Stats card */}
      <div className="bg-surface rounded-xl border border-border-strong">
        <StatsBar entries={entries} />
      </div>

      {/* Grid card */}
      <div className="bg-surface rounded-xl border border-border-strong p-6">
        <FilterBar
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          typeFilters={typeFilters}
          toggleTypeFilter={toggleTypeFilter}
        />
        <MediaGrid
          entries={filteredEntries}
          statusFilter={statusFilter}
          refetch={fetchEntries}
        />
      </div>
    </div>
  )
}
