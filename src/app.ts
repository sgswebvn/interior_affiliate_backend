import express from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import cors from 'cors'
import routes from './routes'
import { errorHandler } from './middlewares/error.middleware'
import { apiLimiter } from './middlewares/rateLimit'

const app = express()
app.set('trust proxy', 1)
app.use(helmet())
app.use(morgan('dev'))

// CORS (configure via env CORS_ORIGIN)
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }))

// Body size limit
app.use(express.json({ limit: process.env.BODY_LIMIT || '2mb' }))

// Rate limiter applied to API routes
app.use('/api', apiLimiter)

app.use('/api', routes)

// Error handler
app.use(errorHandler)

export default app
