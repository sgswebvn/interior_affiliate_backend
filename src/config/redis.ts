
import Redis from 'ioredis'

const REDIS_URL = process.env.REDIS_URL || ''

let redis: Redis | null = null

if (REDIS_URL) {
    console.log('Redis URL found, connecting...')
    redis = new Redis(REDIS_URL)

    redis.on('connect', () => {
        console.log('✅ Redis connected')
    })

    redis.on('error', (err) => {
        console.error('❌ Redis error:', err)
    })
} else {
    console.log('⚠️ No REDIS_URL found. Cache will be disabled (or fallback to memory if implemented).')
}

export default redis
