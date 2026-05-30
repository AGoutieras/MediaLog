import express from 'express'
import searchGames from '../services/rawg.js'
import { searchMovies, searchSeries } from '../services/tmdb.js'

const router = express.Router()

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

export default router
