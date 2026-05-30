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
      cover_url: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
      media_type: "movie",
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
