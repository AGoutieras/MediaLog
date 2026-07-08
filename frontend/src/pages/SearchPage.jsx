import { useState } from 'react'
import { useRef, useEffect } from 'react'
import SearchBar from '../components/SearchBar'
import ResultList from '../components/ResultList'
import EntryModal from '../components/EntryModal'
import debounce from 'lodash.debounce'

/**
 * SearchPage
 * Full search interface for discovering and adding media.
 * Implements debounced auto-search (500ms) with two separate effects:
 * - One for query changes: debounced, to avoid firing on every keystroke
 * - One for type filter changes: immediate, since a filter click is intentional
 *
 * Clicking "+ Add" on a result opens EntryModal to fill in entry details before
 * posting to the backend. The selected media and status are held in state until
 * the modal confirms or cancels.
 */
export default function SearchPage() {
  const [results, setResults] = useState([])
  const [query, setQuery] = useState('')
  const [type, setType] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState(null)
  const [isSearching, setIsSearching] = useState(false)

  // useRef persists the debounced function without recreating it on every render
  // Recreating it would reset the 500s timer on every keystroke
  const debouncedSearch = useRef(
    debounce(searchQuery => {
      handleSearch(searchQuery)
    }, 500)
  ).current

  // Cancel any pending debounce call on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel()
    }
  }, [debouncedSearch])

  async function handleSearch(searchQuery = query) {
    try {
      const response = await fetch(
        `http://localhost:3000/search?q=${searchQuery}&type=${type}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      )
      const data = await response.json()
      setResults(data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsSearching(false)
    }
  }

  // Debounced effect for query changes, fires 500ms after the user stops typing
  // Empty query clears results immediately without waiting for the debounce
  useEffect(() => {
    if (query.trim() === '') {
      setResults([])
      setIsSearching(false)
      return
    }
    setIsSearching(true)
    debouncedSearch(query)
  }, [query])

  // Immediate effect for type filter changes, no debounce needed since
  // switching the filter is a deliberate action, not incremental input
  useEffect(() => {
    if (query.trim() !== '') {
      handleSearch(query)
    }
  }, [type])

  function handleAddMedia(media, status) {
    setSelectedMedia(media)
    setSelectedStatus(status)
    setIsModalOpen(true)
  }

  function handleClose() {
    setIsModalOpen(false)
  }

  async function handleConfirm(fields) {
    try {
      const response = await fetch('http://localhost:3000/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          external_id: selectedMedia.external_id,
          slug: selectedMedia.slug,
          media_type: selectedMedia.media_type,
          title: selectedMedia.title,
          year: selectedMedia.year,
          cover_url: selectedMedia.cover_url,
          status: selectedStatus,
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
      const data = await response.json()
      handleClose()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <>
      <div className="p-8 pt-12">
        <SearchBar
          query={query}
          setQuery={setQuery}
          type={type}
          setType={setType}
          isSearching={isSearching}
        />
        <ResultList results={results} onAdd={handleAddMedia} />
        {isModalOpen && (
          <EntryModal
            media={selectedMedia}
            onClose={handleClose}
            selectedStatus={selectedStatus}
            onAdd={handleConfirm}
          />
        )}
      </div>
    </>
  )
}
