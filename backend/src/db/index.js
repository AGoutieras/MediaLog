import pkg from 'pg'
import dotenv from 'dotenv'

const { Pool } = pkg

dotenv.config()

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

pool.query('SELECT NOW()', (err, res) => {
  if (err) console.error('DB connection error:', err)
  else console.log('DB connected:', res.rows[0])
})