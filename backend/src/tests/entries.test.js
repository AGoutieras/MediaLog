import { jest } from '@jest/globals'
import request from 'supertest'
import express from 'express'

jest.unstable_mockModule('../db/index.js', () => ({
  pool: { query: jest.fn() },
}))

const { pool } = await import('../db/index.js')
const { default: entriesRouter } = await import('../routes/entries.js')

const app = express()
app.use(express.json())
app.use((req, res, next) => {
  req.user = { id: 'user-uuid-123' }
  next()
})
app.use('/entries', entriesRouter)

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

describe('GET /entries', () => {
  beforeEach(() => jest.resetAllMocks())

  test('returns all entries for authenticated user', async () => {
    pool.query.mockResolvedValueOnce({ rows: [mockEntry] })

    const res = await request(app).get('/entries')

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body[0]).toHaveProperty('title', 'The Witcher 3')
    expect(res.body[0]).toHaveProperty('media_type', 'game')
  })

  test('returns empty array when user has no entries', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] })

    const res = await request(app).get('/entries')

    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  test('returns 500 on database error', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB error'))

    const res = await request(app).get('/entries')

    expect(res.status).toBe(500)
  })
})

describe('POST /entries', () => {
  beforeEach(() => jest.resetAllMocks())

  test('creates a new entry successfully', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: 'mediatype-uuid' }] })
      .mockResolvedValueOnce({ rows: [{ id: 'media-uuid-123' }] })
      .mockResolvedValueOnce({ rows: [mockEntry] })

    const res = await request(app).post('/entries').send(newEntry)

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('entry')
    expect(res.body.entry).toHaveProperty('status', 'Planned')
  })

  test('returns 409 if media already in user list', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ id: 'mediatype-uuid' }] })
      .mockResolvedValueOnce({ rows: [{ id: 'media-uuid-123' }] })
      .mockResolvedValueOnce({ rows: [] })

    const res = await request(app).post('/entries').send(newEntry)

    expect(res.status).toBe(409)
    expect(res.body.message).toMatch(/already/i)
  })

  test('returns 400 if media_type is invalid', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] })

    const res = await request(app).post('/entries').send({
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

    const res = await request(app).post('/entries').send(newEntry)

    expect(res.status).toBe(500)
  })
})

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

    const res = await request(app)
      .put('/entries/entry-uuid-123')
      .send(updatedFields)

    expect(res.status).toBe(200)
    expect(res.body.entry.status).toBe('Done')
    expect(res.body.entry.rating).toBe(4.5)
    expect(res.body.entry.note).toBe('Great game')
  })

  test('returns 404 if entry not found or not owned by user', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] })

    const res = await request(app)
      .put('/entries/nonexistent-uuid')
      .send(updatedFields)

    expect(res.status).toBe(404)
    expect(res.body.message).toMatch(/not found/i)
  })

  test('returns 500 on database error', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB error'))

    const res = await request(app)
      .put('/entries/entry-uuid-123')
      .send(updatedFields)

    expect(res.status).toBe(500)
  })
})

describe('DELETE /entries/:id', () => {
  beforeEach(() => jest.resetAllMocks())

  test('deletes an entry successfully and returns 204', async () => {
    pool.query.mockResolvedValueOnce({ rows: [mockEntry] })

    const res = await request(app).delete('/entries/entry-uuid-123')

    expect(res.status).toBe(204)
    expect(res.body).toEqual({})
  })

  test('returns 404 if entry not found or not owned by user', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] })

    const res = await request(app).delete('/entries/nonexistent-uuid')

    expect(res.status).toBe(404)
    expect(res.body.message).toMatch(/not found/i)
  })

  test('returns 500 on database error', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB error'))

    const res = await request(app).delete('/entries/entry-uuid-123')

    expect(res.status).toBe(500)
  })
})
