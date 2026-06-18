export default function SearchBar({
	query,
	setQuery,
	type,
	setType,
	onSearch,
}) {
	const inputClass =
		'bg-zinc-800 border border-zinc-600 text-white rounded-md px-4 py-3 w-full focus:outline-none focus:border-zinc-500';
	const filterBase = 'text-white rounded-full px-5 py-2 transition cursor-pointer';
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
					className='bg-sky-600 hover:bg-sky-500 text-white rounded-md px-4 py-2 transition cursor-pointer'
					type='button'
					onClick={onSearch}
				>
					Search
				</button>
			</div>
			<div className='flex max-w-2xl mx-auto gap-2 mt-3'>
				<button
					className={`${
						type === 'all'
							? 'bg-sky-600 hover:bg-sky-500'
							: 'bg-zinc-800 hover:bg-zinc-700'
					} ${filterBase}`}
					type='button'
					onClick={() => setType('all')}
				>
					All
				</button>
				<button
					className={`${
						type === 'game'
							? 'bg-sky-600 hover:bg-sky-500'
							: 'bg-zinc-800 hover:bg-zinc-700'
					} ${filterBase}`}
					type='button'
					onClick={() => setType('game')}
				>
					Games
				</button>
				<button
					className={`${
						type === 'movie'
							? 'bg-sky-600 hover:bg-sky-500'
							: 'bg-zinc-800 hover:bg-zinc-700'
					} ${filterBase}`}
					type='button'
					onClick={() => setType('movie')}
				>
					Films
				</button>
				<button
					className={`${
						type === 'series'
							? 'bg-sky-600 hover:bg-sky-500'
							: 'bg-zinc-800 hover:bg-zinc-700'
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