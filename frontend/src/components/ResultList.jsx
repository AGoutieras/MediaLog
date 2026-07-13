import MediaCard from './MediaCard'

/**
 * ResultList Component
 * Renders a list of MediaCard components from search results.
 * Array.isArray guard prevents errors if results is undefined
 * during the initial render or while the search is loading.
 */
export default function ResultList({ results, onAdd }) {
  return (
    <div className="max-w-5xl mx-auto grid grid-cols-2 gap-2">
      {Array.isArray(results) &&
        results.map(item => <MediaCard key={item.external_id} result={item} />)}
    </div>
  )
}
