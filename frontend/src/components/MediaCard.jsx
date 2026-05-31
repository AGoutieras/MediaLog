export default function MediaCard({ result }) {
	return (
		<>
			<p>{result.title}</p>
			{result.cover_url ? (
				<img src={result.cover_url} alt={`${result.title} cover`} />
			) : (
				<div>{result.title}</div>
			)}
			<p>{result.year}</p>
			<p>{result.media_type}</p>
		</>
	);
}