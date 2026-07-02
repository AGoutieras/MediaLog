import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function EntryModal({
  media,
  onClose,
  onAdd,
  selectedStatus,
  initialNote = "",
  initialRating = null,
  initialPlatform = "",
  initialStartDate = "",
  initialEndDate = "",
  initialWatchedBefore = false,
  initialCompletionPercentage = null,
  initialPlaytimeHours = "",
  isEditing = false,
}) {
  const { token } = useAuth();

  const [note, setNote] = useState(initialNote);
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(null);

  const [providers, setProviders] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(false);

  const [platform, setPlatform] = useState(initialPlatform);
  const [showCustomPlatform, setShowCustomPlatform] = useState(false);
  const [customPlatform, setCustomPlatform] = useState("");

  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [watchedBefore, setWatchedBefore] = useState(initialWatchedBefore);
  const [trackCompletion, setTrackCompletion] = useState(
    initialCompletionPercentage != null,
  );
  const [completionPercentage, setCompletionPercentage] = useState(
    initialCompletionPercentage ?? 0,
  );
  const [playtimeHours, setPlaytimeHours] = useState(initialPlaytimeHours);

  useEffect(() => {
    if (media.media_type === "movie" || media.media_type === "series") {
      setLoadingProviders(true);
      fetch(
        `http://localhost:3000/search/providers/${media.media_type}/${media.external_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
        .then((res) => res.json())
        .then((data) => setProviders(data.providers ?? []))
        .catch(() => setProviders([]))
        .finally(() => setLoadingProviders(false));
    } else if (media.media_type === "game" && isEditing) {
      setLoadingProviders(true);
      fetch(`http://localhost:3000/search/game/${media.external_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setProviders(data.platforms ?? []))
        .catch(() => setProviders([]))
        .finally(() => setLoadingProviders(false));
    }
  }, [media.media_type, media.external_id, token, isEditing]);

  const platformOptions =
    media.media_type === "game" && !isEditing
      ? (media.platforms ?? []).map((p) => p.name)
      : providers.map((p) => p.name ?? p);

  function handleConfirm() {
    onAdd({
      note,
      rating,
      platform: showCustomPlatform ? customPlatform : platform || null,
      start_date: startDate || null,
      end_date: media.media_type === "movie" ? null : endDate || null,
      watched_before:
        media.media_type === "movie" || media.media_type === "series"
          ? watchedBefore
          : false,
      completion_percentage:
        media.media_type === "game" && trackCompletion
          ? completionPercentage
          : null,
      playtime_hours:
        media.media_type === "game"
          ? playtimeHours === ""
            ? null
            : Number(playtimeHours)
          : null,
    });
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-start justify-center overflow-y-auto py-10 z-50">
      {/* Modal container */}
      <div className="bg-surface border border-border-strong rounded-xl p-6 w-140 shadow-[0_34px_70px_-18px_rgba(0,0,0,0.78)] my-10">
        {/* Header: title + close button */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-white font-semibold">
            {isEditing ? "Edit entry" : `Add to '${selectedStatus}'`}
          </p>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-white hover:cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex gap-4 pb-4 border-b border-border">
          {/* cover + badge */}
          <div className="w-24 shrink-0 flex flex-col gap-2">
            <div className="h-32 overflow-hidden rounded-sm">
              {media.cover_url ? (
                <img
                  className="w-full h-full object-cover"
                  src={media.cover_url}
                  alt={`${media.title} cover`}
                />
              ) : (
                <div className="w-full h-full bg-surface-3 flex items-center justify-center text-white text-xs">
                  {media.title}
                </div>
              )}
            </div>
            <span
              className={`select-none rounded-md px-2 py-1 text-text-primary text-sm w-fit ${
                media.media_type === "game"
                  ? "bg-[#0070CC]"
                  : media.media_type === "movie"
                    ? "bg-[#B20710]"
                    : media.media_type === "series"
                      ? "bg-[#0F9D58]"
                      : "bg-surface-3"
              }`}
            >
              {media.media_type}
            </span>
          </div>

          {/* title + year */}
          <div className="flex flex-col justify-center text-white">
            <p className="font-semibold">{media.title}</p>
            <p className="text-text-muted text-sm">{media.year}</p>
          </div>
        </div>

        {/* Platform */}
        <div className="py-3 border-b border-border flex items-center justify-between gap-4">
          <span className="text-text-secondary text-sm shrink-0">Platform</span>
          <div className="flex flex-col items-end gap-2 w-56">
            <select
              className="bg-surface-2 border border-border-strong text-white rounded-md px-3 py-2 w-full focus:outline-none focus:border-accent"
              value={showCustomPlatform ? "other" : platform}
              onChange={(e) => {
                if (e.target.value === "other") {
                  setShowCustomPlatform(true);
                  setPlatform("");
                } else {
                  setShowCustomPlatform(false);
                  setPlatform(e.target.value);
                }
              }}
              disabled={loadingProviders}
            >
              <option value="">
                {loadingProviders ? "Loading..." : "Select..."}
              </option>
              {platformOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
              <option value="other">Other</option>
            </select>

            {showCustomPlatform && (
              <input
                type="text"
                className="bg-surface-2 border border-border-strong text-white rounded-md px-3 py-2 w-full focus:outline-none focus:border-accent"
                value={customPlatform}
                onChange={(e) => setCustomPlatform(e.target.value)}
                placeholder="Specify..."
              />
            )}
          </div>
        </div>

        {/* Start date */}
        <div className="py-3 border-b border-border flex items-center justify-between gap-4">
          <span className="text-text-secondary text-sm">
            {selectedStatus === "Planned"
              ? "Planned for"
              : media.media_type === "movie"
                ? "Watched on"
                : media.media_type === "series"
                  ? "Started watching"
                  : "Started on"}
          </span>
          <input
            type="date"
            className="bg-surface-2 border border-border-strong text-white rounded-md px-3 py-2 w-56 focus:outline-none focus:border-accent [&::-webkit-calendar-picker-indicator]:invert"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            min={selectedStatus === "Planned" ? today : undefined}
            max={selectedStatus !== "Planned" ? today : undefined}
          />
        </div>

        {/* End date */}
        {media.media_type !== "movie" &&
          selectedStatus !== "Planned" &&
          selectedStatus !== "In Progress" && (
            <div className="py-3 border-b border-border flex items-center justify-between gap-4">
              <span className="text-text-secondary text-sm">
                {media.media_type === "series"
                  ? "Finished watching"
                  : "Finished on"}
              </span>
              <input
                type="date"
                className="bg-surface-2 border border-border-strong text-white rounded-md px-3 py-2 w-56 focus:outline-none focus:border-accent [&::-webkit-calendar-picker-indicator]:invert"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || undefined}
                max={today}
              />
            </div>
          )}

        {/* Watched before - movie and series only */}
        {(media.media_type === "movie" || media.media_type === "series") && (
          <div className="py-3 border-b border-border flex items-center justify-between gap-4">
            <label className="flex items-center gap-2 text-text-secondary text-sm">
              <input
                type="checkbox"
                checked={watchedBefore}
                onChange={(e) => setWatchedBefore(e.target.checked)}
              />
              Watched before
            </label>
          </div>
        )}

        {/* Playtime - game */}
        {media.media_type === "game" && selectedStatus !== "Planned" && (
          <div className="py-3 border-b border-border flex items-center justify-between gap-4">
            <span className="text-text-secondary text-sm">Playtime</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                className="bg-surface-2 border border-border-strong text-white rounded-md px-3 py-2 w-20 text-right focus:outline-none focus:border-accent"
                value={playtimeHours}
                onChange={(e) => setPlaytimeHours(e.target.value)}
                placeholder="0"
              />
              <span className="text-text-muted text-sm">h</span>
            </div>
          </div>
        )}

        {/* Completion percentage - game */}
        {media.media_type === "game" && selectedStatus !== "Planned" && (
          <div className="py-3 border-b border-border flex items-center justify-between gap-4">
            <label className="flex items-center gap-2 text-text-secondary text-sm">
              <input
                type="checkbox"
                checked={trackCompletion}
                onChange={(e) => setTrackCompletion(e.target.checked)}
              />
              Completion
            </label>
            <div className="flex items-center gap-2 w-56">
              <input
                type="range"
                min="0"
                max="100"
                value={completionPercentage}
                disabled={!trackCompletion}
                onChange={(e) =>
                  setCompletionPercentage(Number(e.target.value))
                }
                className="w-full accent-accent disabled:opacity-40"
              />
              <span className="text-white text-sm w-10 text-right">
                {trackCompletion ? `${completionPercentage}%` : "—"}
              </span>
            </div>
          </div>
        )}

        {/* note area */}
        <div className="py-3 border-b border-border">
          <label className="text-text-muted text-xs uppercase tracking-wide">
            Note
          </label>
          <textarea
            className="bg-surface-2 border border-border-strong text-white rounded-md px-4 py-3 w-full focus:outline-none focus:border-accent mt-1"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note..."
          />
        </div>

        {selectedStatus === "Done" && (
          <div className="py-3">
            <label className="text-text-muted text-xs uppercase tracking-wide">
              Rating
            </label>
            <div
              className="flex items-center gap-2 mt-1"
              onMouseLeave={() => setHoverRating(null)}
            >
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = hoverRating ?? rating;
                  const filled = active >= star;
                  const half = active >= star - 0.5 && active < star;

                  return (
                    <div key={star} className="relative w-6 h-6">
                      {/* star svg */}
                      <svg viewBox="0 0 24 24" width="24" height="24">
                        <defs>
                          <linearGradient id={`half-star-${star}`}>
                            <stop offset="50%" stopColor="#FF9D00" />
                            <stop offset="50%" stopColor="transparent" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M9.15316 5.40838C10.4198 3.13613 11.0531 2 12 2C12.9469 2 13.5802 3.13612 14.8468 5.40837L15.1745 5.99623C15.5345 6.64193 15.7144 6.96479 15.9951 7.17781C16.2757 7.39083 16.6251 7.4699 17.3241 7.62805L17.9605 7.77203C20.4201 8.32856 21.65 8.60682 21.9426 9.54773C22.2352 10.4886 21.3968 11.4691 19.7199 13.4299L19.2861 13.9372C18.8096 14.4944 18.5713 14.773 18.4641 15.1177C18.357 15.4624 18.393 15.8341 18.465 16.5776L18.5306 17.2544C18.7841 19.8706 18.9109 21.1787 18.1449 21.7602C17.3788 22.3417 16.2273 21.8115 13.9243 20.7512L13.3285 20.4768C12.6741 20.1755 12.3469 20.0248 12 20.0248C11.6531 20.0248 11.3259 20.1755 10.6715 20.4768L10.0757 20.7512C7.77268 21.8115 6.62118 22.3417 5.85515 21.7602C5.08912 21.1787 5.21588 19.8706 5.4694 17.2544L5.53498 16.5776C5.60703 15.8341 5.64305 15.4624 5.53586 15.1177C5.42868 14.773 5.19043 14.4944 4.71392 13.9372L4.2801 13.4299C2.60325 11.4691 1.76482 10.4886 2.05742 9.54773C2.35002 8.60682 3.57986 8.32856 6.03954 7.77203L6.67589 7.62805C7.37485 7.4699 7.72433 7.39083 8.00494 7.17781C8.28555 6.96479 8.46553 6.64194 8.82547 5.99623L9.15316 5.40838Z"
                          fill={
                            filled
                              ? "#FF9D00"
                              : half
                                ? `url(#half-star-${star})`
                                : "none"
                          }
                          stroke="#FF9D00"
                          strokeWidth="1.5"
                        />
                      </svg>
                      <div className="absolute inset-0 flex">
                        <div
                          className="w-1/2 h-full cursor-pointer"
                          onMouseEnter={() => setHoverRating(star - 0.5)}
                          onClick={() => setRating(star - 0.5)}
                        />
                        <div
                          className="w-1/2 h-full cursor-pointer"
                          onMouseEnter={() => setHoverRating(star)}
                          onClick={() => setRating(star)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {rating != null && (
                <>
                  <span className="text-white text-sm">{rating}/5</span>
                  <button
                    onClick={() => setRating(null)}
                    className="text-text-muted hover:text-white"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* confirm button */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            className="bg-accent hover:bg-accent-hover text-white rounded-md px-4 py-2 w-fit transition cursor-pointer"
            onClick={handleConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
