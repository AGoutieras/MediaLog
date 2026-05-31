export default function SearchBar({
	query,
	setQuery,
	type,
	setType,
	onSearch,
}) {
	const inputClass =
		'bg-zinc-800 border border-zinc-600 text-white rounded-md px-4 py-3 w-full';
	const filterBase = 'text-white rounded-full px-5 py-2';
	return (
		<>
			<div className='flex max-w-2xl mx-auto gap-2'>
				<input
					className={inputClass}
					type='text'
					maxLength='255'
					placeholder='Search games, films, series...'
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === 'Enter') {
							onSearch();
						}
					}}
				/>
				<button
					className='bg-sky-600 text-white rounded-md px-4 py-2'
					type='button'
					onClick={onSearch}
				>
					Search
				</button>
			</div>
			<div className='flex max-w-2xl mx-auto gap-2 mt-3'>
				<button
					className={`${
						type === 'all' ? 'bg-sky-600' : 'bg-zinc-800'
					} ${filterBase}`}
					type='button'
					onClick={() => setType('all')}
				>
					All
				</button>
				<button
					className={`${
						type === 'game' ? 'bg-sky-600' : 'bg-zinc-800'
					} ${filterBase}`}
					type='button'
					onClick={() => setType('game')}
				>
					Games
				</button>
				<button
					className={`${
						type === 'movie' ? 'bg-sky-600' : 'bg-zinc-800'
					} ${filterBase}`}
					type='button'
					onClick={() => setType('movie')}
				>
					Films
				</button>
				<button
					className={`${
						type === 'series' ? 'bg-sky-600' : 'bg-zinc-800'
					} ${filterBase}`}
					type='button'
					onClick={() => setType('series')}
				>
					Series
				</button>
			</div>
		</>
	);
}