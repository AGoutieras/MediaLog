import { useState } from 'react';
import SearchBar from '../components/SearchBar';
import ResultList from '../components/ResultList';

export default function SearchPage() {
	const [results, setResults] = useState([]);
	const [query, setQuery] = useState('');
	const [type, setType] = useState('all');

	async function handleSearch() {
		try {
			const response = await fetch(
				`http://localhost:3000/search?q=${query}&type=${type}`,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem(
							'token'
						)}`,
					},
				}
			);
			const data = await response.json();
			setResults(data);
		} catch (err) {
			console.error(err);
		}
	}

	return (
		<>
			<div className='p-8 pt-12'>
				<SearchBar
					query={query}
					setQuery={setQuery}
					type={type}
					setType={setType}
					onSearch={handleSearch}
				/>
				<ResultList results={results} />
			</div>
		</>
	);
}