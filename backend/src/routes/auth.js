import express from 'express'
import { pool } from '../db/index.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import authMiddleware from '../middleware/auth.js'
import { sendVerificationEmail, sendResetPasswordEmail } from '../services/email.js'

const router = express.Router()

// ------ POST /auth/register ------------------------------------------

router.post('/register', async (req, res) => {
  try {
    const { email, username, password } = req.body

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])

    if (result.rows.length > 0) {
      return res.status(409).json({ message: "Email already in use." })
    }

    const hashed_password = await bcrypt.hash(password, 10)

    // Generate a 6-digit verification code valid for 24 hours
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString()
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000)

    const newUser = await pool.query(
      'INSERT INTO users (email, username, hashed_password, verification_token, verification_token_expires) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, username',
      [email, username, hashed_password, verificationToken, verificationExpires]
    )

    try {
      await sendVerificationEmail(email, verificationToken)
      console.log('Verification email sent to', email)
    } catch (emailErr) {
      console.error('Failed to send verification email:', emailErr.message)
    }

    const token = jwt.sign(newUser.rows[0], process.env.JWT_SECRET, { expiresIn: '24h' })

    return res.status(201).json({ token, user: newUser.rows[0] })
  } catch (err) {
    if (err.code === '23505') {
      if (err.constraint === 'users_username_lower_key') {
        return res.status(409).json({ message: 'Username already in use' })
      }
      if (err.constraint === 'users_email_key') {
        return res.status(409).json({ message: 'Email already in use' })
      }
    }
    console.error(err.message)
    return res.status(500).json({ message: "Internal server error" })
  }
})

// ------ GET /auth/verify-email ------------------------------------------
// Verifies the email using the 6-digit code sent at registration

router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query

    if (!token) {
      return res.status(400).json({ message: 'Code is required' })
    }

    const result = await pool.query(
      'SELECT id FROM users WHERE verification_token = $1 AND verification_token_expires > NOW()',
      [token]
    )

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired code' })
    }

    await pool.query(
      'UPDATE users SET email_verified = true, verification_token = NULL, verification_token_expires = NULL WHERE id = $1',
      [result.rows[0].id]
    )

    const user = await pool.query('SELECT id, email, username FROM users WHERE id = $1', [result.rows[0].id])
    const jwtToken = jwt.sign(user.rows[0], process.env.JWT_SECRET, { expiresIn: '24h' })
    return res.status(200).json({ message: 'Email verified successfully', token: jwtToken, user: user.rows[0] })
  } catch (err) {
    console.error(err.message)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

// ------ POST /auth/login ------------------------------------------

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    const result = await pool.query(
      'SELECT id, email, username, hashed_password, email_verified FROM users WHERE email = $1',
      [email]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const compare = await bcrypt.compare(password, result.rows[0].hashed_password)

    if (!compare) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Block login if email is not verified
    if (!result.rows[0].email_verified) {
      return res.status(403).json({ message: "Please verify your email before logging in" })
    }

    const token = jwt.sign(
      { id: result.rows[0].id, email: result.rows[0].email, username: result.rows[0].username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    return res.status(200).json({
      token,
      user: { id: result.rows[0].id, email: result.rows[0].email, username: result.rows[0].username }
    })
  } catch (err) {
    console.error(err.message)
    return res.status(500).json({ message: "Internal server error" })
  }
})

// ------ POST /auth/forgot-password ------------------------------------------

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body

    const result = await pool.query('SELECT id FROM users WHERE email = $1', [email])

    // Always return 200 to avoid leaking whether the email exists
    if (result.rows.length === 0) {
      return res.status(200).json({ message: 'If this email exists, a reset code has been sent' })
    }

    const resetToken = Math.floor(100000 + Math.random() * 900000).toString()
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000)

    await pool.query(
      'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3',
      [resetToken, resetExpires, result.rows[0].id]
    )

    try {
      await sendResetPasswordEmail(email, resetToken)
      console.log('Reset email sent to', email)
    } catch (emailErr) {
      console.error('Failed to send reset email:', emailErr.message)
    }

    return res.status(200).json({ message: 'If this email exists, a reset code has been sent' })
  } catch (err) {
    console.error(err.message)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

// ------ POST /auth/reset-password ------------------------------------------

router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body

    if (!token || !password) {
      return res.status(400).json({ message: 'Code and password are required' })
    }

    const result = await pool.query(
      'SELECT id FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()',
      [token]
    )

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired code' })
    }

    const hashed_password = await bcrypt.hash(password, 10)

    await pool.query(
      'UPDATE users SET hashed_password = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
      [hashed_password, result.rows[0].id]
    )

    return res.status(200).json({ message: 'Password updated successfully' })
  } catch (err) {
    console.error(err.message)
    return res.status(500).json({ message: 'Internal server error' })
  }
})

// ------ PUT /auth/profile ------------------------------------------

router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { username, email, password, currentPassword } = req.body
    const userId = req.user.id

    let hashedPassword = null

    if (password) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required' })
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