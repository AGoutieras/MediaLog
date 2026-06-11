import { useState } from "react";
import SearchBar from "../components/SearchBar";
import ResultList from "../components/ResultList";
import EntryModal from "../components/EntryModal";

export default function SearchPage() {
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);

  async function handleSearch() {
    try {
      const response = await fetch(
        `http://localhost:3000/search?q=${query}&type=${type}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error(err);
    }
  }

  function handleAddMedia(media, status) {
    setSelectedMedia(media);
    setSelectedStatus(status);
    setIsModalOpen(true);
  }

  function handleClose() {
    setIsModalOpen(false);
  }

  async function handleConfirm(note, rating) {
    try {
      const response = await fetch("http://localhost:3000/entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          external_id: selectedMedia.external_id,
          media_type: selectedMedia.media_type,
          title: selectedMedia.title,
          year: selectedMedia.year,
          cover_url: selectedMedia.cover_url,
          status: selectedStatus,
          note: note,
          rating: rating,
        }),
      });
      const data = await response.json();
      handleClose();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <>
      <div className="p-8 pt-12">
        <SearchBar
          query={query}
          setQuery={setQuery}
          type={type}
          setType={setType}
          onSearch={handleSearch}
        />
        <ResultList results={results} onAdd={handleAddMedia} />
        {isModalOpen && (
          <EntryModal
            media={selectedMedia}
            onClose={handleClose}
            selectedStatus={selectedStatus}
            onAdd={handleConfirm}
          />
        )}
      </div>
    </>
  );
}