import { useState } from 'react'
import { useRef, useEffect } from 'react'
import SearchBar from '../components/SearchBar'
import ResultList from '../components/ResultList'
import EntryModal from '../components/EntryModal'
import debounce from 'lodash.debounce'

export default function SearchPage() {
  const [results, setResults] = useState([])
  const [query, setQuery] = useState('')
  const [type, setType] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState(null)
  const [isSearching, setIsSearching] = useState(false)

  const debouncedSearch = useRef(
    debounce(searchQuery => {
      handleSearch(searchQuery)
    }, 500)
  ).current

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

  useEffect(() => {
    if (query.trim() === '') {
      setResults([])
      setIsSearching(false)
      return
    }
    setIsSearching(true)
    debouncedSearch(query)
  }, [query])

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
          watched_on: fields.watched_on,
          watched_from: fields.watched_from,
          watched_till: fields.watched_till,
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
