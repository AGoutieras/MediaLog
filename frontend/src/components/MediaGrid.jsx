import MediaTile from './MediaTile';

export default function MediaGrid({ entries }) {
  const statuses = ['In Progress', 'Planned', 'Done'];
  return (
    <div>
      {statuses.map((status) => {
        const items = entries.filter((e) => e.status === status);
        return (
          <div key={status} className='mb-8'>
            <p className='text-zinc-400 mb-2'>{status}</p>
            <div className='grid grid-cols-6 gap-4'>
              {items.map((entry) => (
                <MediaTile key={entry.id} entry={entry} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}