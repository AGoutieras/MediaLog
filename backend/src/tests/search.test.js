import { jest } from '@jest/globals'
import request from 'supertest'
import express from 'express'

jest.unstable_mockModule('../services/igdb.js', () => ({
  default: jest.fn(),
  getGameById: jest.fn(),
}))

jest.unstable_mockModule('../services/tmdb.js', () => ({
  searchMovies: jest.fn(),
  searchSeries: jest.fn(),
  getWatchProviders: jest.fn(),
}))

const { default: searchGames, getGameById } = await import('../services/igdb.js')
const { searchMovies, searchSeries, getWatchProviders } = await import('../services/tmdb.js')
const { default: searchRouter } = await import('../routes/search.js')

const app = express()
app.use(express.json())
app.use((req, res, next) => {
  req.user = { id: 'user-uuid-123' }
  next()
})
app.use('/search', searchRouter)

describe('GET /search', () => {
  beforeEach(() => jest.resetAllMocks())

  test('searches games successfully', async () => {
    searchGames.mockResolvedValueOnce([{
      external_id: '1942',
      title: 'The Witcher 3',
      media_type: 'game',
    }])

    const res = await request(app).get('/search?q=witcher&type=game')

    expect(res.status).toBe(200)
    expect(res.body[0]).toHaveProperty('title', 'The Witcher 3')
    expect(res.body[0]).toHaveProperty('media_type', 'game')
  })

  test('searches movies successfully', async () => {
    searchMovies.mockResolvedValueOnce([{
      external_id: '550',
      title: 'Fight Club',
      media_type: 'movie',
    }])

    const res = await request(app).get('/search?q=fight+club&type=movie')

    expect(res.status).toBe(200)
    expect(res.body[0]).toHaveProperty('title', 'Fight Club')
  })

  test('searches series successfully', async () => {
    searchSeries.mockResolvedValueOnce([{
      external_id: '1396',
      title: 'Breaking Bad',
      media_type: 'series',
    }])

    const res = await request(app).get('/search?q=breaking+bad&type=series')

    expect(res.status).toBe(200)
    expect(res.body[0]).toHaveProperty('title', 'Breaking Bad')
  })

  test('searches all types in parallel with Promise.all', async () => {
    searchGames.mockResolvedValueOnce([{ external_id: '1', title: 'Game', media_type: 'game' }])
    searchMovies.mockResolvedValueOnce([{ external_id: '2', title: 'Movie', media_type: 'movie' }])
    searchSeries.mockResolvedValueOnce([{ external_id: '3', title: 'Series', media_type: 'series' }])

    const res = await request(app).get('/search?q=test&type=all')

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(3)
  })

  test('returns 400 if query parameter is missing', async () => {
    const res = await request(app).get('/search?type=game')
    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/missing/i)
  })

  test('returns 400 if media type is invalid', async () => {
    const res = await request(app).get('/search?q=test&type=invalid')
    expect(res.status).toBe(400)
  })

  test('returns 500 on IGDB service error', async () => {
    searchGames.mockRejectedValueOnce(new Error('IGDB error'))

    const res = await request(app).get('/search?q=test&type=game')

    expect(res.status).toBe(500)
  })
})

describe('GET /search/game/:id', () => {
  beforeEach(() => jest.resetAllMocks())

  test('returns platforms for a game', async () => {
    getGameById.mockResolvedValueOnce([
      { id: 6, name: 'PC (Microsoft Windows)', abbreviation: 'PC' },
      { id: 167, name: 'PlayStation 5', abbreviation: 'PS5' },
    ])

    const res = await request(app).get('/search/game/1942')

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('platforms')
    expect(res.body.platforms).toHaveLength(2)
    expect(res.body.platforms[0]).toHaveProperty('abbreviation', 'PC')
  })

  test('returns empty platforms array if game has none', async () => {
    getGameById.mockResolvedValueOnce([])

    const res = await request(app).get('/search/game/9999')

    expect(res.status).toBe(200)
    expect(res.body.platforms).toEqual([])
  })

  test('returns 500 on IGDB error', async () => {
    getGameById.mockRejectedValueOnce(new Error('IGDB error'))

    const res = await request(app).get('/search/game/1942')

    expect(res.status).toBe(500)
  })
})

describe('GET /search/providers/:type/:id', () => {
  beforeEach(() => jest.resetAllMocks())

  test('returns watch providers for a movie', async () => {
    getWatchProviders.mockResolvedValueOnce(['Netflix', 'Disney+'])

    const res = await request(app).get('/search/providers/movie/550')

    expect(res.status).toBe(200)
    expect(res.body.providers).toContain('Netflix')
    expect(res.body.providers).toContain('Disney+')
  })

  test('returns watch providers for a series', async () => {
    getWatchProviders.mockResolvedValueOnce(['Netflix'])

    const res = await request(app).get('/search/providers/series/1396')

    expect(res.status).toBe(200)
    expect(res.body.providers).toContain('Netflix')
  })

  test('returns empty array if no providers available in France', async () => {
    getWatchProviders.mockResolvedValueOnce([])

    const res = await request(app).get('/search/providers/movie/9999')

    expect(res.status).toBe(200)
    expect(res.body.providers).toEqual([])
  })

  test('returns 400 if type is game', async () => {
    const res = await request(app).get('/search/providers/game/1942')
    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/invalid media type/i)
  })

  test('returns 500 on TMDB error', async () => {
    getWatchProviders.mockRejectedValueOnce(new Error('TMDB error'))

    const res = await request(app).get('/search/providers/movie/550')

    expect(res.status).toBe(500)
  })
})
