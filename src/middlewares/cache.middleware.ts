import { Request, Response, NextFunction } from 'express'
import redis from '../config/redis'
import logger from '../config/logger'

type DurationStr = string // "5 minutes"

function parseDuration(duration: DurationStr): number {
    const [count, unit] = duration.split(' ')
    const n = parseInt(count)
    if (unit.startsWith('minute')) return n * 60
    if (unit.startsWith('second')) return n
    if (unit.startsWith('hour')) return n * 3600
    return 60 // default 1 min
}

export const cache = (duration: DurationStr) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (req.method !== 'GET') {
            return next()
        }

        // If Redis not connected, skip cache (Graceful Fallback)
        if (!redis) {
            return next()
        }

        const key = `cache:${req.originalUrl || req.url} `
        const ttl = parseDuration(duration)

        try {
            const cachedBody = await redis.get(key)
            if (cachedBody) {
                res.header('Content-Type', 'application/json')
                res.header('X-Cache', 'HIT')
                return res.send(JSON.parse(cachedBody))
            }
        } catch (error) {
            logger.error('Redis Get Error:', error)
            return next() // proceed if error
        }

        // Intercept response to save to cache
        const originalSend = res.send
        res.send = (body) => {
            if (res.statusCode === 200) {
                // Try to cache
                try {
                    // body might be object or string
                    const value = typeof body === 'string' ? body : JSON.stringify(body)
                    redis?.setex(key, ttl, value).catch(err => logger.error('Redis Set Error', err))
                } catch (e) {
                    logger.error('Cache Serialization Error', e)
                }
            }
            return originalSend.call(res, body)
        }

        next()
    }
}
