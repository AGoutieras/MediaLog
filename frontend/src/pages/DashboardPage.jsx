import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import StatsBar from "../components/StatsBar";
import MediaGrid from "../components/MediaGrid";
import FilterBar from "../components/FilterBar";

export default function DashboardPage() {
  const { token } = useAuth();
  const [entries, setEntries] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilters, setTypeFilters] = useState(["all"]);

  async function fetchEntries() {
    const response = await fetch("http://localhost:3000/entries", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    setEntries(data);
  }

  useEffect(() => {
    fetchEntries();
  }, []);

  const filteredEntries = entries.filter((entry) => {
    const matchStatus = statusFilter === "all" || entry.status === statusFilter;
    const matchType =
      typeFilters.includes("all") || typeFilters.includes(entry.media_type);
    return matchStatus && matchType;
  });

  function toggleTypeFilter(type) {
    if (type === "all") {
      setTypeFilters(["all"]);
      return;
    }

    let updated = typeFilters.includes("all") ? [] : [...typeFilters];

    if (updated.includes(type)) {
      updated = updated.filter((t) => t !== type);
    } else {
      updated.push(type);
    }

    if (updated.length === 0 || updated.length === 3) {
      updated = ["all"];
    }

    setTypeFilters(updated);
  }

  return (
    <div className="max-w-5xl mx-auto px-8">
      <StatsBar entries={entries} />
      <FilterBar
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        typeFilters={typeFilters}
        toggleTypeFilter={toggleTypeFilter}
      />
      <MediaGrid entries={filteredEntries} refetch={fetchEntries} />
    </div>
  );
}