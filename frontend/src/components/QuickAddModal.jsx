import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { X, Loader2, Check } from "lucide-react";
import EntryModal from "./EntryModal";
import debounce from "lodash.debounce";

/**
 * QuickAddModal Component
 * Dashboard shortcut for adding entries without navigating to the search page.
 * Opened by clicking the + button next to a status section header in MediaGrid.
 *
 * Features:
 * - Debounced search (500ms) across all media types simultaneously
 * - Already-added detection: fetches current entries on mount and highlights
 *   results already in the user's list with a checkmark and tooltip
 * - Platform abbreviation pills for game results (from IGDB)
 * - Opens EntryModal when a result is selected to fill in entry details
 */
export default function QuickAddModal({ status, onClose, onAdded }) {
  const { token } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  // addedEntries maps external_id (string) -> status for already-added detection
  const [addedEntries, setAddedEntries] = useState({});

  // useRef persists the debounced function across renders without recreating it
  // Creating it inside the component body would reset the timer on every keystroke
  const debouncedSearch = useRef(
    debounce((searchQuery) => {
      handleSearch(searchQuery);
    }, 500),
  ).current;

  // Cancel any pending debounce call when the component unmounts
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Trigger debounced search on every query change
  // Empty query clears results immediately without waiting for the debounce
  useEffect(() => {
    if (query.trim() === "") {
      setResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    debouncedSearch(query);
  }, [query]);

  async function handleSearch(searchQuery = query) {
    try {
      const response = await fetch(
        `http://localhost:3000/search?q=${searchQuery}&type=all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  }

  async function handleConfirm(fields) {
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
          note: fields.note,
          rating: fields.rating,
          platform: fields.platform,
          start_date: fields.start_date,
          end_date: fields.end_date,
          watched_before: fields.watched_before,
          completion_percentage: fields.completion_percentage,
          playtime_hours: fields.playtime_hours,
        }),
      });
      const data = await response.json();
      // Notify the parent to refetch entries, then close both modals
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

  // Fetch current entries on mount to build the already-added map
  // external_id is coerced to string since IGDB returns numeric IDs
  // but they are stored as strings in the DB
  useEffect(() => {
    fetch("http://localhost:3000/entries", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const map = {};
        data.forEach((e) => {
          map[String(e.external_id)] = e.status;
        });
        setAddedEntries(map);
      })
      .catch(() => {});
  }, [token]);

  return (
    <div className="fixed inset-0 backdrop-blur-xs flex items-center justify-center">
      {/* Search panel - hidden when EntryModal is open to avoid stacking modals */}
      {!isEntryModalOpen && (
        <div className="bg-surface border border-border-strong rounded-xl p-6 w-2xl shadow-[0_34px_70px_-18px_rgba(0,0,0,0.78)]">
          <div className="flex justify-between items-center mb-4">
            <p className="text-white font-semibold">Add to '{status}'</p>
            <button
              onClick={onClose}
              className="text-text-muted hover:cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              className="bg-surface-2 border border-border-strong text-white rounded-md px-4 py-2 w-full focus:outline-none focus:border-accent"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {isSearching && (
              <Loader2
                size={18}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted animate-spin"
              />
            )}
          </div>
          <div className="mt-4 max-h-80 overflow-y-auto">
            {results.map((result) => (
              <div
                key={result.external_id}
                onClick={() => handleSelectMedia(result)}
                // Already-added entries get an elevated background to distinguish them
                className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                  addedEntries[String(result.external_id)]
                    ? "bg-surface-2 hover:bg-surface-3"
                    : "hover:bg-surface-2"
                }`}
              >
                <div className="w-10 h-14 overflow-hidden rounded-sm shrink-0">
                  {result.cover_url ? (
                    <img
                      src={result.cover_url}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-surface-3" />
                  )}
                </div>
                <div className="flex-1 flex items-center justify-between">
                  <div className="text-white text-sm">
                    <p>{result.title}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-text-muted text-xs">{result.year}</p>
                      {/* Platform abbreviation pills, games only, sourced from IGDB */}
                      {result.media_type === "game" &&
                        result.platforms?.length > 0 && (
                          <>
                            <span className="text-text-faint text-xs">·</span>
                            {result.platforms.map((p) => (
                              <span
                                key={p.id}
                                className="text-text-muted text-xs bg-surface-3 rounded-2xl px-1.5 py-0.5"
                              >
                                {/* Use abbreviation if available (e.g. "PS5"), fallback to full name */}
                                {p.abbreviation ?? p.name}
                              </span>
                            ))}
                          </>
                        )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Checkmark with tooltip for already-added entries
                        group/tooltip scopes hover state to this element only */}
                    {addedEntries[String(result.external_id)] && (
                      <div className="relative group/tooltip">
                        <Check
                          size={16}
                          className="text-accent-soft shrink-0"
                        />
                        <div className="absolute right-0 bottom-full mb-1 w-max px-2 py-1 bg-surface-3 border border-border-strong text-text-secondary text-xs rounded-md opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-100 pointer-events-none">
                          Already in '{addedEntries[String(result.external_id)]}
                          '
                        </div>
                      </div>
                    )}
                    {/* Media type badge */}
                    <span
                      className={`select-none rounded-md px-2 py-1 text-text-primary text-xs w-fit ${
                        result.media_type === "game"
                          ? "bg-[#0070CC]"
                          : result.media_type === "movie"
                            ? "bg-[#B20710]"
                            : result.media_type === "series"
                              ? "bg-[#0F9D58]"
                              : "bg-surface-3"
                      }`}
                    >
                      {result.media_type}
                    </span>
                  </div>
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
