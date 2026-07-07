import { jest } from '@jest/globals'
import request from 'supertest'
import express from 'express'

jest.unstable_mockModule('../db/index.js', () => ({
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

jest.unstable_mockModule('../middleware/auth.js', () => ({
  default: (req, res, next) => {
    req.user = { id: 'user-uuid-123' }
    next()
  },
}))

const { pool } = await import('../db/index.js')
const bcrypt = (await import('bcrypt')).default
const { default: authRouter } = await import('../routes/auth.js')
await import('../middleware/auth.js')

const app = express()
app.use(express.json())
app.use('/auth', authRouter)

describe('POST /auth/register', () => {
  beforeEach(() => jest.resetAllMocks())

  test('registers a new user successfully', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [{ id: 'uuid-123', username: 'testuser', email: 'test@test.com' }],
      })

    bcrypt.hash.mockResolvedValueOnce('hashedpassword')

    const res = await request(app).post('/auth/register').send({
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

    const res = await request(app).post('/auth/register').send({
      username: 'testuser',
      email: 'existing@test.com',
      password: 'password123',
    })

    expect(res.status).toBe(409)
    expect(res.body.message).toMatch(/email/i)
  })

  test('returns 409 if username is already in use (DB constraint)', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [] })
      .mockRejectedValueOnce({
        code: '23505',
        constraint: 'users_username_lower_key',
      })

    bcrypt.hash.mockResolvedValueOnce('hashedpassword')

    const res = await request(app).post('/auth/register').send({
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

    const res = await request(app).post('/auth/register').send({
      username: 'testuser',
      email: 'test@test.com',
      password: 'password123',
    })

    expect(res.status).toBe(500)
  })
})

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

    const res = await request(app).post('/auth/login').send({
      email: 'test@test.com',
      password: 'password123',
    })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('user')
  })

  test('returns 401 if user not found', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] })

    const res = await request(app).post('/auth/login').send({
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

    const res = await request(app).post('/auth/login').send({
      email: 'test@test.com',
      password: 'wrongpassword',
    })

    expect(res.status).toBe(401)
    expect(res.body.message).toMatch(/invalid credentials/i)
  })

  test('returns 500 on database error', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB error'))

    const res = await request(app).post('/auth/login').send({
      email: 'test@test.com',
      password: 'password123',
    })

    expect(res.status).toBe(500)
  })
})

describe('PUT /auth/profile', () => {
  beforeEach(() => jest.resetAllMocks())

  test('updates username successfully', async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 'user-uuid-123', username: 'newuser', email: 'test@test.com' }]
    })

    const res = await request(app).put('/auth/profile')
      .set('Authorization', 'Bearer valid.token')
      .send({ username: 'newuser' })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('user')
  })

  test('returns 401 if current password is incorrect', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ hashed_password: 'hash' }] })
    bcrypt.compare.mockResolvedValueOnce(false)

    const res = await request(app).put('/auth/profile')
      .set('Authorization', 'Bearer valid.token')
      .send({ password: 'newpass', currentPassword: 'wrongpass' })

    expect(res.status).toBe(401)
    expect(res.body.message).toMatch(/incorrect/i)
  })

  test('returns 400 if new password provided without current password', async () => {
    const res = await request(app).put('/auth/profile')
      .set('Authorization', 'Bearer valid.token')
      .send({ password: 'newpass' })

    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/current password/i)
  })

  test('returns 409 if new username already taken', async () => {
    pool.query.mockRejectedValueOnce({
      code: '23505',
      constraint: 'users_username_lower_key',
    })

    const res = await request(app).put('/auth/profile')
      .set('Authorization', 'Bearer valid.token')
      .send({ username: 'takenuser' })

    expect(res.status).toBe(409)
    expect(res.body.message).toMatch(/username/i)
  })

  test('returns 500 on database error', async () => {
    pool.query.mockRejectedValueOnce(new Error('DB error'))

    const res = await request(app).put('/auth/profile')
      .set('Authorization', 'Bearer valid.token')
      .send({ username: 'newuser' })

    expect(res.status).toBe(500)
  })
})