import express from 'express'
import searchGames, { getGameById } from '../services/igdb.js'
import { searchMovies, searchSeries, getWatchProviders, } from '../services/tmdb.js'

const router = express.Router()

// ------ GET /search ------------------------------------------

router.get('/', async (req, res) => {
  try {
    const {
      q,
      type
    } = req.query

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

      return res.status(200).json([...games, ...movies, ...series])
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

export default router
