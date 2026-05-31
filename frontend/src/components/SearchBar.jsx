export default function SearchBar({
	query,
	setQuery,
	type,
	setType,
	onSearch,
}) {
	return (
		<>
			<input
				type="text"
				maxLength="255"
				placeholder="Search games, films, series..."
				value={query}
				onChange={(e) => setQuery(e.target.value)}
			/>
			<button type="button" onClick={() => setType("all")}>
				All
			</button>
			<button type="button" onClick={() => setType("game")}>
				Games
			</button>
			<button type="button" onClick={() => setType("movie")}>
				Films
			</button>
			<button type="button" onClick={() => setType("series")}>
				Series
			</button>
			<button type="button" onClick={onSearch}>
				Search
			</button>
		</>
	);
}