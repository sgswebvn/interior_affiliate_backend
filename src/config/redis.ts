
import Redis from 'ioredis'
import logger from './logger'

const REDIS_URL = process.env.REDIS_URL || ''

let redis: Redis | null = null

if (REDIS_URL) {
    logger.info('Redis URL found, connecting...')
    redis = new Redis(REDIS_URL)

    redis.on('connect', () => {
        logger.info('✅ Redis connected')
    })

    redis.on('error', (err) => {
        logger.error('❌ Redis error:', err)
    })
} else {
    logger.warn('⚠️ No REDIS_URL found. Cache will be disabled (or fallback to memory if implemented).')
}

export default redis
