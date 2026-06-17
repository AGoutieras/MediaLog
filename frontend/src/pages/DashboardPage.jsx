import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import StatsBar from '../components/StatsBar';
import MediaGrid from '../components/MediaGrid';

export default function DashboardPage() {
  const { token } = useAuth();
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    async function fetchEntries() {
      const response = await fetch('http://localhost:3000/entries', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setEntries(data);
    }
    fetchEntries();
  }, []);
  return (
    <div className='px-8'>
      <StatsBar entries={entries} />
      <MediaGrid entries={entries} />
    </div>
  );
}