import express from 'express'
import { pool } from '../db/index.js'

const router = express.Router()

router.get('/', async (req, res) =>{
  try {
    const result = await pool.query('SELECT * FROM media_entries WHERE user_id = $1', [req.user.id])

    return res.status(200).json(result.rows)
  }
  catch (err) {
    res.status(500).json({message: 'Internal server error'})
  }
})

export default router