export default function FilterBar({ statusFilter, setStatusFilter, typeFilters, toggleTypeFilter }) {
  const statuses = ['all', 'In Progress', 'Planned', 'Done']
  const types = ['all', 'game', 'movie', 'series']

  return (
    <div className="flex justify-between items-center py-4">
      {/* Status filters */}
      <div className="flex gap-2">
        {statuses.map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`rounded-full px-4 py-1.5 text-sm cursor-pointer transition ${
              statusFilter === status
                ? 'bg-sky-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            {status === 'all' ? 'All' : status}
          </button>
        ))}
      </div>

      {/* Type filters */}
      <div className="flex gap-2">
        {types.map(type => (
          <button
            key={type}
            onClick={() => toggleTypeFilter(type)}
            className={`rounded-full px-4 py-1.5 text-sm cursor-pointer transition ${
              typeFilters.includes(type)
                ? 'bg-sky-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            {type === 'all' ? 'All' : type === 'game' ? 'Games' : type === 'movie' ? 'Films' : 'Series'}
          </button>
        ))}
      </div>
    </div>
  )
}