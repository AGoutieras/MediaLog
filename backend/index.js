dotenv.config()

import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import './src/db/index.js'
import authRouter from './src/routes/auth.js'


const app = express()
const PORT = process.env.PORT

app.use(cors())

app.use(express.json())

app.use('/auth', authRouter)

app.listen(PORT, () => {
  console.log("Server listening on PORT", PORT)
})