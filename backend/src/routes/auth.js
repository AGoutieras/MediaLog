import express from 'express'
import { pool } from '../db/index.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import authMiddleware from '../middleware/auth.js'

const router = express.Router()

router.post('/register', async (req, res) =>
{
  try
  {
    const
    {
      email,
      username,
      password
    } = req.body

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])

    if (result.rows.length > 0)
    {
      return res.status(409).json(
      {
        message: "Email already in use."
      })
    }

    const hashed_password = await bcrypt.hash(password, 10)

    const newUser = await pool.query('INSERT INTO users (email, username, hashed_password) VALUES ($1, $2, $3) RETURNING id, email, username', [email, username, hashed_password])

    const token = jwt.sign(newUser.rows[0], process.env.JWT_SECRET,
    {
      expiresIn: '24h'
    })

    return res.status(201).json(
    {
      token,
      user: newUser.rows[0]
    })
  }
  catch (err)
  {
    if (err.code === '23505') {
      if (err.constraint === 'users_username_lower_key') {
        return res.status(409).json({ message: 'Username already in use'})
      }
      if (err.constraint === 'users_email_key') {
        return res.status(409).json({ message: 'Email already in use'})
      }
    }
    console.error(err.message)
    return res.status(500).json(
    {
      message: "Internal server error"
    })
  }
})

router.post('/login', async (req, res) =>
{
  try
  {
    const
    {
      email,
      password
    } = req.body

    const result = await pool.query('SELECT id, email, username, hashed_password FROM users WHERE email = $1', [email])

    if (result.rows.length === 0)
    {
      return res.status(401).json(
      {
        message: "Invalid credentials"
      })
    }

    const compare = await bcrypt.compare(password, result.rows[0].hashed_password)

    if (!compare) {
      return res.status(401).json({message: "Invalid credentials"})
    }

    const token = jwt.sign({id: result.rows[0].id, email: result.rows[0].email, username: result.rows[0].username}, process.env.JWT_SECRET,
    {
      expiresIn: '24h'
    })

    return res.status(200).json(
    {
      token,
      user: { id: result.rows[0].id, email: result.rows[0].email, username: result.rows[0].username}
    })
  }
  catch(err)
  {
    console.error(err.message)
    return res.status(500).json(
    {
      message: "Internal server error"
    })
  }
})

router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { username, email, password, currentPassword } = req.body
    const userId = req.user.id

    let hashedPassword = null

    if (password) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required'})
      }

      const userResult = await pool.query(
        'SELECT hashed_password FROM users WHERE id = $1',
        [userId]
      )

      const isMatch = await bcrypt.compare(currentPassword, userResult.rows[0].hashed_password)

      if (!isMatch) {
        return res.status(401).json({ message: 'Current password is incorrect' })
      }

      hashedPassword = await bcrypt.hash(password, 10)
    }

    const result = await pool.query(
      `UPDATE users SET
        username = COALESCE($1, username),
        email = COALESCE($2, email),
        hashed_password = COALESCE($3, hashed_password)
       WHERE id = $4
       RETURNING id, email, username`,
      [username, email, hashedPassword, userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    const token = jwt.sign(result.rows[0], process.env.JWT_SECRET, { expiresIn: '24h' })

    return res.status(200).json({ token, user: result.rows[0] })
  } catch (err) {
      if (err.code === '23505') {
        if (err.constraint === 'users_username_lower_key') {
          return res.status(409).json({ message: 'Username already in use.' })
        }
        if (err.constraint === 'users_email_key') {
          return res.status(409).json({ message: 'Email already in use.' })
        }
      }
      console.error(err.message)
      return res.status(500).json({ message: 'Internal server error' })
  }
})

export default router