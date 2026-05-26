import express from 'express'
import { pool } from '../db/index.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const router = express.Router()

router.post('/register', async (req, res) => {
  try {
    const {
      email,
      username,
      password
    } = req.body

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])

    if (result.rows.length > 0) {
      return res.status(409).json({
        message: "Email already in use."
      })
    }

    const hashed_password = await bcrypt.hash(password, 10)

    const newUser = await pool.query('INSERT INTO users (email, username, hashed_password) VALUES ($1, $2, $3) RETURNING id, email, username', [email, username, hashed_password])

    const token = jwt.sign(newUser.rows[0], process.env.JWT_SECRET, {
      expiresIn: '1h'
    })

    res.status(201).json({
      token,
      user: newUser.rows[0]
    })
  } catch (err) {
    console.error(err.message)
    res.status(500).json({
      message: "Internal server error"
    })
  }
})

export default router
