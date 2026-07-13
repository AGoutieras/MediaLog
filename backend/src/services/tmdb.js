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

// Fetches full details for a single movie, used for the media detail page
export async function getMovieDetails(id) {
  const tmdbResponse = await fetch(
    `https://api.themoviedb.org/3/movie/${id}?append_to_response=credits,images`,
    { headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` } }
  )
  const m = await tmdbResponse.json()

  return {
    external_id: m.id,
    title: m.title,
    media_type: 'movie',
    cover_url: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
    backdrop_url: m.backdrop_path ? `https://image.tmdb.org/t/p/w1280${m.backdrop_path}` : null,
    year: m.release_date?.slice(0, 4) ?? null,
    summary: m.overview ?? null,
    genres: m.genres?.map(g => g.name) ?? [],
    runtime: m.runtime ?? null,
    rating: m.vote_average ? Math.round(m.vote_average * 10) : null,
    rating_count: m.vote_count ?? null,
    directors: m.credits?.crew?.filter(c => c.job === 'Director').map(c => c.name) ?? [],
    cast: m.credits?.cast?.slice(0, 6).map(c => c.name) ?? [],
    screenshots: m.images?.backdrops?.slice(0, 6).map(b => `https://image.tmdb.org/t/p/w1280${b.file_path}`) ?? [],
  }
}

// Fetches full details for a single series, used for the media detail page
export async function getSeriesDetails(id) {
  const tmdbResponse = await fetch(
    `https://api.themoviedb.org/3/tv/${id}?append_to_response=credits,images`,
    { headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` } }
  )
  const s = await tmdbResponse.json()

  return {
    external_id: s.id,
    title: s.name,
    media_type: 'series',
    cover_url: s.poster_path ? `https://image.tmdb.org/t/p/w500${s.poster_path}` : null,
    backdrop_url: s.backdrop_path ? `https://image.tmdb.org/t/p/w1280${s.backdrop_path}` : null,
    year: s.first_air_date?.slice(0, 4) ?? null,
    summary: s.overview ?? null,
    genres: s.genres?.map(g => g.name) ?? [],
    seasons: s.number_of_seasons ?? null,
    episodes: s.number_of_episodes ?? null,
    rating: s.vote_average ? Math.round(s.vote_average * 10) : null,
    rating_count: s.vote_count ?? null,
    creators: s.created_by?.map(c => c.name) ?? [],
    cast: s.credits?.cast?.slice(0, 6).map(c => c.name) ?? [],
    screenshots: s.images?.backdrops?.slice(0, 6).map(b => `https://image.tmdb.org/t/p/w1280${b.file_path}`) ?? [],
    status: s.status ?? null,
  }
}
