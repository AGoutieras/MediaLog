import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import './src/db/index.js'
import authRouter from './src/routes/auth.js'
import entriesRouter from './src/routes/entries.js'
import authMiddleware from './src/middleware/auth.js'
import searchRouter from './src/routes/search.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT

app.use(cors({
  origin: ['https://medialog-app.vercel.app', 'http://localhost:5173', 'http://127.0.0.1:5173']
}))

app.use(express.json())

// Public routes, no authentication required
app.use('/auth', authRouter)

// authMiddleware is applied globally here so all routes declared after
// this line require a valid JWT, /entries and /search are both protected
app.use(authMiddleware)

app.use('/entries', entriesRouter)

app.use('/search', searchRouter)

app.listen(PORT, () => {
  console.log("Server listening on PORT", PORT)
})
