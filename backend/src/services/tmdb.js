/**
 * TMDB API Service
 * TMDB uses a Bearer token in the Authorization header for authentication.
 * The API key stored in TMDB_API_KEY is the full read access token (v4 auth).
 */

export async function searchMovies(query) {
  const tmdbResponse = await fetch(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}`, {
    headers: {
      'Authorization': `Bearer ${process.env.TMDB_API_KEY}`
    }
  })
  const tmdbData = await tmdbResponse.json()
  const formattedResults = tmdbData.results.map((movie) => {
    return {
      external_id: movie.id,
      title: movie.title,
      // poster_path is a relative path, prepend the TMDB image base URL with w500 size
      cover_url: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
      media_type: "movie",
      // release_date is "YYYY-MM-DD", slice the first 4 characters to get the year
      year: movie.release_date?.slice(0, 4)
    }
  })
  return formattedResults
}

export async function searchSeries(query) {
  const tmdbResponse = await fetch(`https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(query)}`, {
    headers: {
      'Authorization': `Bearer ${process.env.TMDB_API_KEY}`
    }
  })
  const tmdbData = await tmdbResponse.json()
  const formattedResults = tmdbData.results.map((tv) => {
    return {
      external_id: tv.id,
      title: tv.name,
      cover_url: tv.poster_path ? `https://image.tmdb.org/t/p/w500${tv.poster_path}` : null,
      media_type: "series",
      year: tv.first_air_date?.slice(0, 4)
    }
  })
  return formattedResults
}

// Fetches flatrate (subscription) streaming providers for a film or series
// Results are filtered to France (FR), other countries are ignored
export async function getWatchProviders(id, mediaType) {
  // TMDB uses "movie" and "tv" in URL paths, map our internal "series" type to "tv"
  const endpoint = mediaType === 'movie' ? 'movie' : 'tv'
  const tmdbResponse = await fetch(`https://api.themoviedb.org/3/${endpoint}/${id}/watch/providers`, {
    headers: {
      'Authorization': `Bearer ${process.env.TMDB_API_KEY}`
    }
  })
  const tmdbData = await tmdbResponse.json()
  // Optional chaining handles cases where FR or flatrate providers are absent
  const providers = tmdbData.results?.FR?.flatrate ?? []

  // Return only the provider names for use in the platform dropdown
  return providers.map((provider) => provider.provider_name)
}