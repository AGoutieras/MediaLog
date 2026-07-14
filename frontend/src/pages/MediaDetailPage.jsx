import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import EntryModal from '../components/EntryModal'
import { ArrowLeft, Star, CircleCheckBig } from 'lucide-react'
import API_URL from '../config.js'

/**
 * MediaDetailPage
 * Displays full details for a single media item (game, movie, or series).
 * Fetches data from the backend which proxies IGDB or TMDB.
 * Includes an "Add to list" button that opens EntryModal with a status dropdown.
 */
export default function MediaDetailPage() {
  const { type, id } = useParams()
  const { token } = useAuth()
  const navigate = useNavigate()

  const [media, setMedia] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState(null)
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false)
  const [selectedScreenshot, setSelectedScreenshot] = useState(null)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomOrigin, setZoomOrigin] = useState('center')
  const [existingEntry, setExistingEntry] = useState(null)

  useEffect(() => {
    async function fetchDetails() {
      try {
        const res = await fetch(`${API_URL}/search/details/${type}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        setMedia(data)
        document.title = `MediaLog - ${data.title}`
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchDetails()

    return () => {
      document.title = 'MediaLog'
    }
  }, [type, id, token])

  useEffect(() => {
    fetch(`${API_URL}/entries`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        const found = data.find(e => String(e.external_id) === String(id))
        setExistingEntry(found ?? null)
      })
      .catch(() => {})
  }, [id, token])

  async function handleConfirm(fields) {
    try {
      await fetch(`${API_URL}/entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          external_id: media.external_id,
          slug: media.slug ?? null,
          media_type: media.media_type,
          title: media.title,
          year: media.year,
          cover_url: media.cover_url,
          status: selectedStatus,
          note: fields.note,
          rating: fields.rating,
          platform: fields.platform,
          start_date: fields.start_date,
          end_date: fields.end_date,
          watched_before: fields.watched_before,
          completion_percentage: fields.completion_percentage,
          playtime_hours: fields.playtime_hours,
        }),
      })
      setIsModalOpen(false)
      setSelectedStatus(null)
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-text-muted">Loading...</p>
      </div>
    )
  }

  if (!media) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-text-muted">Media not found.</p>
      </div>
    )
  }

  const badgeColor =
    type === 'game'
      ? 'bg-[#0070CC]'
      : type === 'movie'
        ? 'bg-[#B20710]'
        : 'bg-[#0F9D58]'

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-text-muted hover:text-white mb-8 cursor-pointer transition-colors"
      >
        <ArrowLeft size={18} />
        Back to search
      </button>

      {/* Hero section */}
      <div className="relative flex flex-col sm:flex-row gap-6 sm:gap-8 p-6 sm:p-8">
        {/* Backdrop */}
        {media.backdrop_url && (
          <div className="absolute inset-0 rounded-xl overflow-hidden">
            <img
              src={media.backdrop_url}
              alt=""
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-linear-to-r from-surface via-surface/80 to-transparent" />
          </div>
        )}

        {/* Add to list — top right */}
        <div className="absolute top-6 right-6 z-10">
          {existingEntry ? (
            <div className="flex items-center gap-2">
              <CircleCheckBig size={16} className="text-success" />
              <span className="text-success text-sm">In your list</span>
              <span className="text-text-muted text-xs border border-border-strong rounded-md px-2 py-0.5">
                {existingEntry.status}
              </span>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className="bg-accent hover:bg-accent-hover text-white rounded-md px-5 py-2 transition cursor-pointer"
              >
                + Add to list
              </button>

              <div
                className="absolute right-0 top-full mt-1 w-40 overflow-hidden transition-all duration-100 z-10"
                style={{
                  clipPath: isStatusDropdownOpen
                    ? 'inset(0 0 0 0)'
                    : 'inset(0 0 100% 0)',
                }}
              >
                <div className="bg-surface-2 border border-border-strong rounded-md">
                  {['Planned', 'In Progress', 'Done'].map(status => (
                    <button
                      key={status}
                      onClick={() => {
                        setSelectedStatus(status)
                        setIsStatusDropdownOpen(false)
                        setIsModalOpen(true)
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-surface-3 cursor-pointer"
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="relative flex flex-col sm:flex-row gap-6 sm:gap-8">
          {/* Cover */}
          <div className="shrink-0 w-40 sm:w-52 h-56 sm:h-76 overflow-hidden rounded-lg bg-surface-2 shadow-[0_8px_32px_rgba(0,0,0,0.5)] mx-auto sm:mx-0">
            {media.cover_url ? (
              <img
                src={media.cover_url}
                alt={media.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-muted text-sm px-4 text-center">
                {media.title}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col flex-1 py-2">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span
                  className={`${badgeColor} text-white text-xs rounded-md px-2 py-1 select-none`}
                >
                  {media.media_type}
                </span>
                {media.year && (
                  <span className="text-text-muted text-sm border border-border-strong rounded-md px-2 py-0.5">
                    {media.year}
                  </span>
                )}
              </div>

              <h1 className="text-white text-2xl sm:text-4xl font-bold mb-4 leading-tight">
                {media.title}
              </h1>

              {/* Genres */}
              {media.genres?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {media.genres.map(g => (
                    <span
                      key={g}
                      className="text-text-secondary text-xs bg-surface-3 border border-border rounded-full px-3 py-1"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}

              {/* Rating */}
              {(media.rating || media.aggregated_rating) && (
                <div className="flex items-center gap-3 mb-4">
                  {media.rating && (
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-xl select-none ${
                          media.rating >= 60
                            ? 'bg-green-600'
                            : media.rating >= 40
                              ? 'bg-yellow-500'
                              : 'bg-red-600'
                        }`}
                      >
                        {media.rating}
                      </div>
                      <span className="text-text-faint text-xs mt-1">User</span>
                    </div>
                  )}
                  {media.aggregated_rating && (
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-xl select-none ${
                          media.aggregated_rating >= 60
                            ? 'bg-green-600'
                            : media.aggregated_rating >= 40
                              ? 'bg-yellow-500'
                              : 'bg-red-600'
                        }`}
                      >
                        {media.aggregated_rating}
                      </div>
                      <span className="text-text-faint text-xs mt-1">
                        Press
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Meta info */}
              <div className="flex flex-col gap-1.5 text-sm text-text-secondary">
                {media.developers?.length > 0 && (
                  <p>
                    <span className="text-text-muted">Developer:</span>{' '}
                    {media.developers.join(', ')}
                  </p>
                )}
                {media.publishers?.length > 0 && (
                  <p>
                    <span className="text-text-muted">Publisher:</span>{' '}
                    {media.publishers.join(', ')}
                  </p>
                )}
                {media.themes?.length > 0 && (
                  <p>
                    <span className="text-text-muted">Themes:</span>{' '}
                    {media.themes.join(', ')}
                  </p>
                )}
                {media.runtime && (
                  <p>
                    <span className="text-text-muted">Runtime:</span>{' '}
                    {media.runtime} min
                  </p>
                )}
                {media.directors?.length > 0 && (
                  <p>
                    <span className="text-text-muted">Director:</span>{' '}
                    {media.directors.join(', ')}
                  </p>
                )}
                {media.seasons && (
                  <p>
                    <span className="text-text-muted">Seasons:</span>{' '}
                    {media.seasons} ({media.episodes} episodes)
                  </p>
                )}
                {media.creators?.length > 0 && (
                  <p>
                    <span className="text-text-muted">Created by:</span>{' '}
                    {media.creators.join(', ')}
                  </p>
                )}
                {media.status && (
                  <p>
                    <span className="text-text-muted">Status:</span>{' '}
                    {media.status}
                  </p>
                )}
                {media.cast?.length > 0 && (
                  <p>
                    <span className="text-text-muted">Cast:</span>{' '}
                    {media.cast.join(', ')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      {(media.summary || media.platforms?.length > 0) && (
        <div className="bg-surface border border-border-strong rounded-xl p-6 mb-2">
          {media.summary && (
            <>
              <h2 className="text-white font-semibold text-lg mb-3">
                Overview
              </h2>
              <p className="text-text-secondary leading-relaxed">
                {media.summary}
              </p>
            </>
          )}

          {media.platforms?.length > 0 && (
            <div className={media.summary ? 'mt-6' : ''}>
              <h2 className="text-white font-semibold text-lg mb-3">
                Platforms
              </h2>
              <div className="flex flex-wrap gap-2">
                {media.platforms.map(p => (
                  <span
                    key={p.id}
                    className="text-text-secondary text-sm bg-surface-2 border border-border rounded-md px-3 py-1"
                  >
                    {p.abbreviation ?? p.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Screenshots */}
      {media.screenshots?.length > 0 && (
        <div className="bg-surface border border-border-strong rounded-xl p-6 mb-2">
          <h2 className="text-white font-semibold text-lg mb-3">Screenshots</h2>
          <div className="grid grid-cols-3 gap-3">
            {media.screenshots.slice(0, 6).map((url, i) => (
              <div
                key={i}
                className="aspect-video overflow-hidden rounded-lg bg-surface-2 cursor-pointer hover:opacity-50 transition-opacity"
                onClick={() => setSelectedScreenshot(url)}
              >
                <img
                  src={url}
                  alt={`Screenshot ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EntryModal */}
      {isModalOpen && selectedStatus && (
        <EntryModal
          media={{
            ...media,
            platforms: media.platforms ?? [],
          }}
          selectedStatus={selectedStatus}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedStatus(null)
          }}
          onAdd={handleConfirm}
        />
      )}

      {selectedScreenshot && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => {
            setSelectedScreenshot(null)
            setIsZoomed(false)
          }}
        >
          <img
            src={selectedScreenshot}
            alt="Screenshot"
            style={{ transformOrigin: isZoomed ? zoomOrigin : 'center' }}
            className={`max-w-[90vw] max-h-[90vh] rounded-lg shadow-2xl transition-transform duration-200 ${
              isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
            }`}
            onClick={e => {
              e.stopPropagation()
              setIsZoomed(!isZoomed)
            }}
            onMouseMove={e => {
              if (!isZoomed) return
              const rect = e.currentTarget.getBoundingClientRect()
              const x = ((e.clientX - rect.left) / rect.width) * 100
              const y = ((e.clientY - rect.top) / rect.height) * 100
              setZoomOrigin(`${x}% ${y}%`)
            }}
          />
        </div>
      )}
    </div>
  )
}
