import MediaCard from "./MediaCard";

export default function ResultList({ results }) {
	return (
		<>
			{Array.isArray(results) &&
				results.map((item) => (
					<MediaCard key={item.external_id} result={item} />
				))}
		</>
	);
}