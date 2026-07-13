import express from 'express'
import searchGames, { getGameById, getGameDetails } from '../services/igdb.js'
import { searchMovies, searchSeries, getWatchProviders, getMovieDetails, getSeriesDetails } from '../services/tmdb.js'

const router = express.Router()

// ------ GET /search ------------------------------------------

router.get('/', async (req, res) => {
  try {
    const { q, type } = req.query

    if (!q || !type) {
      return res.status(400).json({
        message: 'Missing required parameters'
      })
    }

    if (type === 'game') {
      const results = await searchGames(q)
      return res.status(200).json(results)
    } else if (type === 'movie') {
      const results = await searchMovies(q)
      return res.status(200).json(results)
    } else if (type === 'series') {
      const results = await searchSeries(q)
      return res.status(200).json(results)
    } else if (type === 'all') {
      // Run all three API calls in parallel to reduce total response time
      // compared to sequential awaits
      const [games, movies, series] = await Promise.all([
        searchGames(q),
        searchMovies(q),
        searchSeries(q)
      ])

      const all = [...games, ...movies, ...series]

      // Sort by title similarity to the query:
      // exact match → starts with → contains → alphabetical fallback
      const queryLower = q.toLowerCase()
      all.sort((a, b) => {
        const aTitle = a.title.toLowerCase()
        const bTitle = b.title.toLowerCase()

        if (aTitle === queryLower && bTitle !== queryLower) return -1
        if (bTitle === queryLower && aTitle !== queryLower) return 1

        if (aTitle.startsWith(queryLower) && !bTitle.startsWith(queryLower)) return -1
        if (bTitle.startsWith(queryLower) && !aTitle.startsWith(queryLower)) return 1

        if (aTitle.includes(queryLower) && !bTitle.includes(queryLower)) return -1
        if (bTitle.includes(queryLower) && !aTitle.includes(queryLower)) return 1

        return aTitle.localeCompare(bTitle)
      })

      return res.status(200).json(all)
    } else {
      return res.status(400).json({
        message: 'invalid media type'
      })
    }
  } catch (err) {
    return res.status(500).json({
      message: 'Internal server error'
    })
  }
})

// ------ GET /search/providers/:type/:id ------------------------------------------
// Fetches flatrate streaming providers for a film or series from TMDB
// filtered to France (FR), only available for movies and series types

router.get('/providers/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params

    if (type !== 'movie' && type !== 'series') {
      return res.status(400).json({
        message: 'invalid media type'
      })
    }

    const providers = await getWatchProviders(id, type)

    return res.status(200).json({ providers })
  } catch (err) {
    return res.status(500).json({
      message: 'Internal server error'
    })
  }
})

// ------ GET /search/game/:id ------------------------------------------
// Fetches the platform list for a specific game from IGDB by its external ID
// Used when opening the edit modal, sincd platform data is not stored in the DB

router.get('/game/:id', async (req, res) => {
  try {
    const { id } = req.params
    const platforms = await getGameById(id)
    return res.status(200).json({ platforms })
  } catch (err) {
    return res.status(500).json({
      message: 'Internal server error'
    })
  }
})

// ------ GET /search/game/:id ------------------------------------------
// Fetches full game details from IGDB for the media detail page

router.get('/details/game/:id', async (req, res) => {
  try {
    const { id } = req.params
    const details = await getGameDetails(id)
    if (!details) return res.status(404).json({ message: 'Game not found' })
    return res.status(200).json(details)
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error' })
  }
})

// ------ GET /search/movie/:id ------------------------------------------
// Fetches full movie details from TMDB for the media detail page

router.get('/details/movie/:id', async (req, res) => {
  try {
    const { id } = req.params
    const details = await getMovieDetails(id)
    if (!details) return res.status(404).json({ message: 'Movie not found' })
    return res.status(200).json(details)
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error' })
  }
})

// ------ GET /search/series/:id ------------------------------------------
// Fetches full series details from TMDB for the media detail page

router.get('/details/series/:id', async (req, res) => {
  try {
    const { id } = req.params
    const details = await getSeriesDetails(id)
    if (!details) return res.status(404).json({ message: 'Series not found' })
    return res.status(200).json(details)
  } catch (err) {
    return res.status(500).json({ message: 'Internal server error' })
  }
})

export default router
