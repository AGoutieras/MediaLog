import MediaCard from './MediaCard';

export default function ResultList({ results, onAdd }) {
  return (
    <>
      <div className='max-w-2xl mx-auto'>
        {Array.isArray(results) &&
          results.map((item) => (
            <MediaCard key={item.external_id} result={item} onAdd={onAdd} />
          ))}
      </div>
    </>
  );
}