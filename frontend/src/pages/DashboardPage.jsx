import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import StatsBar from "../components/StatsBar";

export default function DashboardPage() {
  const { token } = useAuth();
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    async function fetchEntries() {
      const response = await fetch("http://localhost:3000/entries", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setEntries(data);
    }
    fetchEntries();
  }, []);
  return (
    <div>
      <StatsBar entries={entries} />
    </div>
  );
}
