import { jest } from '@jest/globals'
import request from 'supertest'
import express from 'express'

jest.unstable_mockModule('../db/index.js', () => ({
  pool: { query: jest.fn() },
}))

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    sign: jest.fn(() => 'mocked.jwt.token'),
    verify: jest.fn(),
  },
}))

const jwt = (await import('jsonwebtoken')).default
const { default: authMiddleware } = await import('../middleware/auth.js')

const app = express()
app.use(express.json())
app.use(authMiddleware)
app.get('/protected', (req, res) => res.status(200).json({ user: req.user }))

describe('Auth middleware', () => {
  beforeEach(() => jest.resetAllMocks())

  test('passes with a valid JWT token', async () => {
    jwt.verify.mockReturnValueOnce({ id: 'user-uuid-123', username: 'testuser' })

    const res = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer valid.jwt.token')

    expect(res.status).toBe(200)
    expect(res.body.user).toHaveProperty('id', 'user-uuid-123')
  })

  test('returns 401 if no Authorization header', async () => {
    const res = await request(app).get('/protected')
    expect(res.status).toBe(401)
  })

  test('returns 401 if token is malformed', async () => {
    jwt.verify.mockImplementationOnce(() => {
      throw new Error('invalid token')
    })

    const res = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer bad.token')

    expect(res.status).toBe(401)
  })

  test('returns 401 if token is expired', async () => {
    jwt.verify.mockImplementationOnce(() => {
      throw new Error('TokenExpiredError')
    })

    const res = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer expired.token')

    expect(res.status).toBe(401)
  })
})
