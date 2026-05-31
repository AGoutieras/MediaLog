export default function MediaCard({ result }) {
	return (
		<>
			<div className='flex items-center mt-6 border-b border-zinc-700 gap-4 py-4'>
				<div className='text-white w-14 h-20 overflow-hidden rounded-sm'>
					{result.cover_url ? (
						<img
							className='w-full h-full object-cover'
							src={result.cover_url}
							alt={`${result.title} cover`}
						/>
					) : (
						<div>{result.title}</div>
					)}
				</div>
				<div className='flex-1 text-white'>
					<div className='flex gap-2'>
						<p>{result.title}</p>
						<span
							className={`rounded-full px-2 py-1 text-sm ${
								result.media_type === 'game'
									? 'bg-purple-800'
									: result.media_type === 'movie'
									? 'bg-orange-800'
									: result.media_type === 'series'
									? 'bg-green-800'
									: 'bg-zinc-600'
							}`}
						>
							{result.media_type}
						</span>
					</div>
					<p className='text-zinc-400'>{result.year}</p>
				</div>
				<div>
					<button
						className='text-sky-600 rounded-full px-4 py-2 border border-transparent hover:border hover:border-sky-500 transition'
						type='button'
						onClick={() => {}} // TODO: open EntryModal
					>
						+ Add
					</button>
				</div>
			</div>
		</>
	);
}