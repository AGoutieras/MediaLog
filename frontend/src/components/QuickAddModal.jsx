import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { X, EllipsisVertical, } from "lucide-react";
import EntryModal from "./EntryModal";

export default function QuickAddModal({ status, onClose, onAdded }) {
  const { token } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);

  async function handleSearch() {
    try {
      const response = await fetch(
        `http://localhost:3000/search?q=${query}&type=all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleConfirm(note, rating) {
    try {
      const response = await fetch("http://localhost:3000/entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          external_id: selectedMedia.external_id,
          slug: selectedMedia.slug,
          media_type: selectedMedia.media_type,
          title: selectedMedia.title,
          year: selectedMedia.year,
          cover_url: selectedMedia.cover_url,
          status: status,
          note: note,
          rating: rating,
        }),
      });
      const data = await response.json();
      onAdded();
      onClose();
    } catch (err) {
      console.error(err);
    }
  }

  function handleSelectMedia(media) {
    setSelectedMedia(media);
    setIsEntryModalOpen(true);
  }

  return (
    <div className="fixed inset-0 backdrop-blur-xs flex items-center justify-center">
      {!isEntryModalOpen && (
        <div className="bg-zinc-800 rounded-xl p-6 w-2xl">
          <div className="flex justify-between items-center mb-4">
            <p className="text-white font-semibold">Add to '{status}'</p>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
          <input
            type="text"
            className="bg-zinc-700 border border-zinc-600 text-white rounded-md px-4 py-2 w-full focus:outline-none focus:border-zinc-500"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
          />
          <div className="mt-4 max-h-80 overflow-y-auto">
            {results.map((result) => (
              <div
                key={result.external_id}
                onClick={() => handleSelectMedia(result)}
                className="flex items-center gap-3 p-2 hover:bg-zinc-700 rounded-md cursor-pointer"
              >
                <div className="w-10 h-14 overflow-hidden rounded-sm shrink-0">
                  {result.cover_url ? (
                    <img
                      src={result.cover_url}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-600" />
                  )}
                </div>
                <div className="text-white text-sm">
                  <p>{result.title}</p>
                  <p className="text-zinc-400 text-xs">{result.year}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {isEntryModalOpen && (
        <EntryModal
          media={selectedMedia}
          selectedStatus={status}
          onClose={() => setIsEntryModalOpen(false)}
          onAdd={handleConfirm}
        />
      )}
    </div>
  );
}