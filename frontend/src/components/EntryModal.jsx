import { useState } from "react";

export default function EntryModal({ media, onClose, onAdd, selectedStatus }) {
  const [note, setNote] = useState("");
  const [rating, setRating] = useState(null);
  const [hoverRating, setHoverRating] = useState(null);
  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center">
      {/* Modal container */}
      <div className="bg-zinc-800 rounded-xl p-6 w-175 py">
        {/* Header: title + close button */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-white font-semibold">Add to '{selectedStatus}'</p>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:cursor-pointer"
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

        <div className="flex gap-4">
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
                <div className="w-full h-full bg-zinc-600 flex items-center justify-center text-white text-xs">
                  {media.title}
                </div>
              )}
            </div>
            <span
              className={`rounded-md px-2 py-1 text-zinc-200 text-sm w-fit ${
                media.media_type === "game"
                  ? "bg-purple-800"
                  : media.media_type === "movie"
                  ? "bg-orange-800"
                  : media.media_type === "series"
                  ? "bg-green-800"
                  : "bg-zinc-600"
              }`}
            >
              {media.media_type}
            </span>
          </div>

          {/* title + year */}
          <div className="flex flex-col justify-center text-white">
            <p className="font-semibold">{media.title}</p>
            <p className="text-zinc-400 text-sm">{media.year}</p>
          </div>
        </div>
        {/* note area */}
        <textarea
          className="bg-zinc-800 border border-zinc-600 text-white rounded-md px-4 py-3 w-full focus:outline-none focus:border-zinc-500 mt-4"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note..."
        />

        {selectedStatus === "Done" && (
          <div
            className="flex items-center gap-2 mt-4"
            onMouseLeave={() => setHoverRating(null)}
          >
            <span className="text-zinc-400 text-sm">Rating :</span>

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
                  className="text-zinc-400 hover:text-white"
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
        )}

        {/* confirm button */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            className="bg-sky-600 hover:bg-sky-500 text-white rounded-md px-4 py-2 w-fit transition"
            onClick={() => onAdd(note, rating)}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#000000">
  <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
  <g
    id="SVGRepo_tracerCarrier"
    stroke-linecap="round"
    stroke-linejoin="round"
  ></g>
  <g id="SVGRepo_iconCarrier">
    <path d="M23.054 8.781l-7.536-.635-2.965-7.082a.619.619 0 0 0-1.155 0L8.433 8.145.896 8.78a.607.607 0 0 0-.357 1.1l5.726 4.96-1.729 7.395a.63.63 0 0 0 .223.679.573.573 0 0 0 .339.108.717.717 0 0 0 .374-.111l6.503-3.954 6.503 3.953a.606.606 0 0 0 .935-.677l-1.727-7.392 5.725-4.96a.607.607 0 0 0-.357-1.099zm-6.48 5.698l1.662 7.113-6.261-3.806-6.262 3.807 1.663-7.114-5.513-4.776 7.257-.611 2.855-6.817 2.855 6.817 7.257.611z"></path>
    <path fill="none" d="M0 0h24v24H0z"></path>
  </g>
</svg>;