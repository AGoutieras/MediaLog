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

app.use(cors())

app.use(express.json())

app.use('/auth', authRouter)

app.use(authMiddleware)

app.use('/entries', entriesRouter)

app.use('/search', searchRouter)

app.listen(PORT, () =>
{
  console.log("Server listening on PORT", PORT)
})
