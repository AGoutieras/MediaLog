import { useState } from 'react'
import { useRef, useEffect } from 'react'
import SearchBar from '../components/SearchBar'
import ResultList from '../components/ResultList'
import debounce from 'lodash.debounce'
import API_URL from '../config.js'

/**
 * SearchPage
 * Full search interface for discovering media.
 * Implements debounced auto-search (500ms) with two separate effects:
 * - One for query changes: debounced, to avoid firing on every keystroke
 * - One for type filter changes: immediate, since a filter click is intentional
 *
 * Clicking "Details" on a result navigates to the media detail page (/media/:type/:id).
 */
export default function SearchPage() {
  const [results, setResults] = useState([])
  const [query, setQuery] = useState('')
  const [type, setType] = useState('all')
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
        `${API_URL}/search?q=${searchQuery}&type=${type}`,
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

  return (
    <div className="p-4 pt-12 sm:p-8 sm:pt-12">
      <SearchBar
        query={query}
        setQuery={setQuery}
        type={type}
        setType={setType}
        isSearching={isSearching}
      />
      <ResultList results={results} />
    </div>
  )
}
