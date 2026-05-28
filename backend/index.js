import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import './src/db/index.js'
import authRouter from './src/routes/auth.js'
import authMiddleware from './src/middleware/auth.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT

app.use(cors())

app.use(express.json())

app.use('/auth', authRouter)

app.use(authMiddleware)

app.listen(PORT, () =>
{
  console.log("Server listening on PORT", PORT)
})
