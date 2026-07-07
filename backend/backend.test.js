import { jest } from '@jest/globals'
import request from 'supertest'
import express from 'express'

// ─── Mocks ───────────────────────────────────────────────────────────────────

jest.unstable_mockModule('./src/db/index.js', () => ({
  pool: { query: jest.fn() },
}))

jest.unstable_mockModule('bcrypt', () => ({
  default: { hash: jest.fn(), compare: jest.fn() },
}))

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    sign: jest.fn(() => 'mocked.jwt.token'),
    verify: jest.fn(),
  },
}))

jest.unstable_mockModule('./src/services/igdb.js', () => ({
  default: jest.fn(),
  getGameById: jest.fn(),
}))

jest.unstable_mockModule('./src/services/tmdb.js', () => ({
  searchMovies: jest.fn(),
  searchSeries: jest.fn(),
  getWatchProviders: jest.fn(),
}))

// ─── Imports dynamiques ───────────────────────────────────────────────────────

const { pool } = await import('./src/db/index.js')
const bcrypt = (await import('bcrypt')).default
const jwt = (await import('jsonwebtoken')).default
const { default: searchGames, getGameById } = await import('./src/services/igdb.js')
const { searchMovies, searchSeries, getWatchProviders } = await import('./src/services/tmdb.js')
const { default: authRouter } = await import('./src/routes/auth.js')
const { default: entriesRouter } = await import('./src/routes/entries.js')
const { default: searchRouter } = await import('./src/routes/search.js')
const { default: authMiddleware } = await import('./src/middleware/auth.js')

// ─── Apps ─────────────────────────────────────────────────────────────────────

const authApp = express()
authApp.use(express.json())
authApp.use('/auth', authRouter)

const protectedApp = express()
protectedApp.use(express.json())
protectedApp.use((req, res, next) => {
  req.user = { id: 'user-uuid-123' }
  next()
})
protectedApp.use('/entries', entriesRouter)
protectedApp.use('/search', searchRouter)

const middlewareApp = express()
middlewareApp.use(express.json())
middlewareApp.use(authMiddleware)
middlewareApp.get('/protected', (req, res) =>
  res.status(200).json({ user: req.user })
)

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockEntry = {
  id: 'entry-uuid-123',
  user_id: 'user-uuid-123',
  media_id: 'media-uuid-123',
  status: 'Planned',
  rating: null,
  note: null,
  platform: 'PS5',
  start_date: null,
  end_date: null,
  watched_before: false,
  completion_percentage: null,
  playtime_hours: null,
  created_at: '2026-07-01T00:00:00.000Z',
  external_id: '1942',
  title: 'The Witcher 3',
  year: '2015',
  cover_url: 'https://example.com/cover.jpg',
  media_type: 'game',
  slug: 'the-witcher-3-wild-hunt',
}

const newEntry = {
  external_id: '1942',
  slug: 'the-witcher-3-wild-hunt',
  media_type: 'game',
  title: 'The Witcher 3',
  year: '2015',
  cover_url: 'https://example.com/cover.jpg',
  status: 'Planned',
  platform: 'PS5',
}

// ─── Auth middleware ───────────────────────────────────────────────────────────
// Note: the middleware splits on ' ' and takes index [1],
// so 'InvalidFormat token' passes with 'token' as the JWT value.

describe('Auth middleware', () => {
  beforeEach(() => jest.resetAllMocks())

  test('passes with a valid JWT token', async () => {
    jwt.verify.mockReturnValueOnce({ id: 'user-uuid-123', username: 'testuser' })

    const res = await request(middlewareApp)
      .get('/protected')
      .set('Authorization', 'Bearer valid.jwt.token')

    expect(res.status).toBe(200)
    expect(res.body.user).toHaveProperty('id', 'user-uuid-123')
  })

  test('returns 401 if no Authorization header', async () => {
    const res = await request(middlewareApp).get('/protected')
    expect(res.status).toBe(401)
  })

  test('returns 401 if token is malformed', async () => {
    jwt.verify.mockImplementationOnce(() => {
      throw new Error('invalid token')
    })

    const res = await request(middlewareApp)
      .get('/protected')
      .set('Authorization', 'Bearer bad.token')

    expect(res.status).toBe(401)
  })

  test('returns 401 if token is expired', async () => {
    jwt.verify.mockImplementationOnce(() => {
      throw new Error('TokenExpiredError')
    })

    const res = await request(middlewareApp)
      .get('/protected')
      .set('Authorization', 'Bearer expired.token')

    expect(res.status).toBe(401)
  })
})

// ─── POST /auth/register ──────────────────────────────────────────────────────

describe('POST /auth/register', () => {
  beforeEach(() => jest.resetAllMocks())

  test('registers a new user successfully', async () => {
    // email check returns no existing user
    pool.query
      .mockResolvedValueOnce({ rows: [] })
      // insert returns new user
      .mockResolvedValueOnce({
        rows: [{ id: 'uuid-123', username: 'testuser', email: 'test@test.com' }],
      })

    bcrypt.hash.mockResolvedValueOnce('hashedpassword')

    const res = await request(authApp).post('/auth/register').send({
      username: 'testuser',
      email: 'test@test.com',
      password: 'password123',
    })

    expect(res.status).toBe(201)
  expect(res.body).toHaveProperty('user')
  expect(res.body.user).toHaveProperty('username', 'testuser')
  })

  test('returns 409 if email is already in use', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 'uuid-existing' }] })

    const res = await request(authApp).post('/auth/register').send({
      username: 'testuser',
      email: 'existing@test.com',
      password: 'password123',
    })

    expect(res.status).toBe(409)
    expect(res.body.message).toMatch(/email/i)
  })

  test('returns 409 if username is already in use (DB constraint)', async () => {
    // email check passes, but DB throws a unique constraint error on username
    pool.query
    .mockResolvedValueOnce({ rows: [] })
    .mockRejectedValueOnce({
      code: '23505',
      constraint: 'users_username_lower_key',
    })

  bcrypt.hash.mockResolvedValueOnce('hashedpassword')

    const res = await request(authApp).post('/auth/register').send({
      username: 'existinguser',
      email: 'new@test.com',
      password: 'password123',
    })

    expect(res.status).toBe(409)
    expect(res.body.message).toMatch(/username/i)
  })

  test('returns 500 on unexpected database error', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [] })
      .mockRejectedValueOnce(new Error('DB connection lost'))

    bcrypt.hash.mockResolvedValueOnce('hashedpassword')

    const res = await request(authApp).post('/auth/register').send({
      username: 'testuser',
      email: 'test@test.com',
      password: 'password123',
    })

    expect(res.status).toBe(500)
  })
})

// ─── POST /auth/login ─────────────────────────────────────────────────────────

describe('POST /auth/login', () => {
  beforeEach(() => jest.resetAllMocks())

  test('logs in successfully with correct credentials', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{
        id: 'uuid-123',
        username: 'testuser',
        email: 'test@test.com',
        hashed_password: 'hashedpassword',
      }],
    })

    bcrypt.compare.mockResolvedValueOnce(true)

    const res = await request(authApp).post('/auth/login').send({
      email: 'test@test.com',
      password: 'password123',
    })

    expect(res.status).toBe(200)
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('user') 
  })

  test('returns 401 if user not found', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] })

    const res = await request(authApp).post('/auth/login').send({
      email: 'notfound@test.com',
      password: 'password123',
    })

    expect(res.status).toBe(401)
    expect(res.body.message).toMatch(/invalid credentials/i)
  })

  test('returns 401 if password is incorrect', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{
        id: 'uuid-123',
        username: 'testuser',
        email: 'test@test.com',
        hashed_password: 'hashedpassword',
      }],
    })

    bcrypt.compare.mockResolvedValueOnce(false)

    const res = await request(authApp).post('/auth/login').send({
      email: 'test@test.com',
      password: 'wrongpassword',
    })

    expect(res.status).toBe(401)
    expect(res.body.message).toMatch(/invalid credentials/i)
  })

  test('returns 500 on database error', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB error'))

    const res = await request(authApp).post('/auth/login').send({
      email: 'test@test.com',
      password: 'password123',
    })

    expect(res.status).toBe(500)
  })
})

// ─── GET /entries ─────────────────────────────────────────────────────────────

describe('GET /entries', () => {
  beforeEach(() => jest.resetAllMocks())

  test('returns all entries for authenticated user', async () => {
    pool.query.mockResolvedValueOnce({ rows: [mockEntry] })

    const res = await request(protectedApp).get('/entries')

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body[0]).toHaveProperty('title', 'The Witcher 3')
    expect(res.body[0]).toHaveProperty('media_type', 'game')
  })

  test('returns empty array when user has no entries', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] })

    const res = await request(protectedApp).get('/entries')

    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  test('returns 500 on database error', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB error'))

    const res = await request(protectedApp).get('/entries')

    expect(res.status).toBe(500)
  })
})

// ─── POST /entries ────────────────────────────────────────────────────────────

describe('POST /entries', () => {
  beforeEach(() => jest.resetAllMocks())

  test('creates a new entry successfully', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: 'mediatype-uuid' }] }) // media_type lookup
      .mockResolvedValueOnce({ rows: [{ id: 'media-uuid-123' }] }) // media insert
      .mockResolvedValueOnce({ rows: [mockEntry] })                  // user_media insert

    const res = await request(protectedApp).post('/entries').send(newEntry)

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('entry')
    expect(res.body.entry).toHaveProperty('status', 'Planned')
  })

  test('returns 409 if media already in user list', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: 'mediatype-uuid' }] })
      .mockResolvedValueOnce({ rows: [{ id: 'media-uuid-123' }] })
      .mockResolvedValueOnce({ rows: [] }) // ON CONFLICT DO NOTHING returned nothing

    const res = await request(protectedApp).post('/entries').send(newEntry)

    expect(res.status).toBe(409)
    expect(res.body.message).toMatch(/already/i)
  })

  test('returns 400 if media_type is invalid', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] }) // media_type not found

    const res = await request(protectedApp).post('/entries').send({
      ...newEntry,
      media_type: 'invalid',
    })

    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/invalid media type/i)
  })

  test('returns 500 on database error', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: 'mediatype-uuid' }] })
      .mockRejectedValueOnce(new Error('DB error'))

    const res = await request(protectedApp).post('/entries').send(newEntry)

    expect(res.status).toBe(500)
  })
})

// ─── PUT /entries/:id ─────────────────────────────────────────────────────────

describe('PUT /entries/:id', () => {
  beforeEach(() => jest.resetAllMocks())

  const updatedFields = {
    status: 'Done',
    rating: 4.5,
    note: 'Great game',
    platform: 'PS5',
    playtime_hours: 80,
    completion_percentage: 100,
  }

  test('updates an entry successfully', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ ...mockEntry, ...updatedFields }],
    })

    const res = await request(protectedApp)
      .put('/entries/entry-uuid-123')
      .send(updatedFields)

    expect(res.status).toBe(200)
    expect(res.body.entry.status).toBe('Done')
    expect(res.body.entry.rating).toBe(4.5)
    expect(res.body.entry.note).toBe('Great game')
  })

  test('returns 404 if entry not found or not owned by user', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] })

    const res = await request(protectedApp)
      .put('/entries/nonexistent-uuid')
      .send(updatedFields)

    expect(res.status).toBe(404)
    expect(res.body.message).toMatch(/not found/i)
  })

  test('returns 500 on database error', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB error'))

    const res = await request(protectedApp)
      .put('/entries/entry-uuid-123')
      .send(updatedFields)

    expect(res.status).toBe(500)
  })
})

// ─── DELETE /entries/:id ──────────────────────────────────────────────────────

describe('DELETE /entries/:id', () => {
  beforeEach(() => jest.resetAllMocks())

  test('deletes an entry successfully and returns 204', async () => {
    pool.query.mockResolvedValueOnce({ rows: [mockEntry] })

    const res = await request(protectedApp).delete('/entries/entry-uuid-123')

    expect(res.status).toBe(204)
    expect(res.body).toEqual({})
  })

  test('returns 404 if entry not found or not owned by user', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] })

    const res = await request(protectedApp).delete('/entries/nonexistent-uuid')

    expect(res.status).toBe(404)
    expect(res.body.message).toMatch(/not found/i)
  })

  test('returns 500 on database error', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB error'))

    const res = await request(protectedApp).delete('/entries/entry-uuid-123')

    expect(res.status).toBe(500)
  })
})

// ─── GET /search ──────────────────────────────────────────────────────────────

describe('GET /search', () => {
  beforeEach(() => jest.resetAllMocks())

  test('searches games successfully', async () => {
    searchGames.mockResolvedValueOnce([{
      external_id: '1942',
      title: 'The Witcher 3',
      media_type: 'game',
    }])

    const res = await request(protectedApp).get('/search?q=witcher&type=game')

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

    const res = await request(protectedApp).get('/search?q=fight+club&type=movie')

    expect(res.status).toBe(200)
    expect(res.body[0]).toHaveProperty('title', 'Fight Club')
  })

  test('searches series successfully', async () => {
    searchSeries.mockResolvedValueOnce([{
      external_id: '1396',
      title: 'Breaking Bad',
      media_type: 'series',
    }])

    const res = await request(protectedApp).get('/search?q=breaking+bad&type=series')

    expect(res.status).toBe(200)
    expect(res.body[0]).toHaveProperty('title', 'Breaking Bad')
  })

  test('searches all types in parallel with Promise.all', async () => {
    searchGames.mockResolvedValueOnce([{ external_id: '1', title: 'Game', media_type: 'game' }])
    searchMovies.mockResolvedValueOnce([{ external_id: '2', title: 'Movie', media_type: 'movie' }])
    searchSeries.mockResolvedValueOnce([{ external_id: '3', title: 'Series', media_type: 'series' }])

    const res = await request(protectedApp).get('/search?q=test&type=all')

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(3)
  })

  test('returns 400 if query parameter is missing', async () => {
    const res = await request(protectedApp).get('/search?type=game')
    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/missing/i)
  })

  test('returns 400 if media type is invalid', async () => {
    const res = await request(protectedApp).get('/search?q=test&type=invalid')
    expect(res.status).toBe(400)
  })

  test('returns 500 on IGDB service error', async () => {
    searchGames.mockRejectedValueOnce(new Error('IGDB error'))

    const res = await request(protectedApp).get('/search?q=test&type=game')

    expect(res.status).toBe(500)
  })
})

// ─── GET /search/game/:id ─────────────────────────────────────────────────────

describe('GET /search/game/:id', () => {
  beforeEach(() => jest.resetAllMocks())

  test('returns platforms for a game', async () => {
    getGameById.mockResolvedValueOnce([
      { id: 6, name: 'PC (Microsoft Windows)', abbreviation: 'PC' },
      { id: 167, name: 'PlayStation 5', abbreviation: 'PS5' },
    ])

    const res = await request(protectedApp).get('/search/game/1942')

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('platforms')
    expect(res.body.platforms).toHaveLength(2)
    expect(res.body.platforms[0]).toHaveProperty('abbreviation', 'PC')
  })

  test('returns empty platforms array if game has none', async () => {
    getGameById.mockResolvedValueOnce([])

    const res = await request(protectedApp).get('/search/game/9999')

    expect(res.status).toBe(200)
    expect(res.body.platforms).toEqual([])
  })

  test('returns 500 on IGDB error', async () => {
    getGameById.mockRejectedValueOnce(new Error('IGDB error'))

    const res = await request(protectedApp).get('/search/game/1942')

    expect(res.status).toBe(500)
  })
})

// ─── GET /search/providers/:type/:id ─────────────────────────────────────────

describe('GET /search/providers/:type/:id', () => {
  beforeEach(() => jest.resetAllMocks())

  test('returns watch providers for a movie', async () => {
    getWatchProviders.mockResolvedValueOnce(['Netflix', 'Disney+'])

    const res = await request(protectedApp).get('/search/providers/movie/550')

    expect(res.status).toBe(200)
    expect(res.body.providers).toContain('Netflix')
    expect(res.body.providers).toContain('Disney+')
  })

  test('returns watch providers for a series', async () => {
    getWatchProviders.mockResolvedValueOnce(['Netflix'])

    const res = await request(protectedApp).get('/search/providers/series/1396')

    expect(res.status).toBe(200)
    expect(res.body.providers).toContain('Netflix')
  })

  test('returns empty array if no providers available in France', async () => {
    getWatchProviders.mockResolvedValueOnce([])

    const res = await request(protectedApp).get('/search/providers/movie/9999')

    expect(res.status).toBe(200)
    expect(res.body.providers).toEqual([])
  })

  test('returns 400 if type is game (not supported)', async () => {
    const res = await request(protectedApp).get('/search/providers/game/1942')
    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/invalid media type/i)
  })

  test('returns 500 on TMDB error', async () => {
    getWatchProviders.mockRejectedValueOnce(new Error('TMDB error'))

    const res = await request(protectedApp).get('/search/providers/movie/550')

    expect(res.status).toBe(500)
  })
})
