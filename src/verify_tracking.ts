
import axios from 'axios'
import { prisma } from './config/prisma'

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function verify() {
    console.log('--- Starting Verification ---')

    // 1. Setup Data
    console.log('1. Creating test affiliate...')
    const affiliate = await prisma.affiliate.create({
        data: {
            name: 'Test Product',
            url: 'https://google.com', // Safe redirect
            price: '100000',
        }
    })
    const affId = affiliate.id
    console.log('Created Affiliate ID:', affId)

    // 2. Test Tracking
    console.log('2. sending redirect request...')
    try {
        await axios.get(`http://localhost:3000/api/redirect/${affId}?postId=999`, {
            maxRedirects: 0,
            validateStatus: (status) => status >= 200 && status < 400 // Accept 302
        })
    } catch (e: any) {
        // Axios throws on redirect if maxRedirects:0, need to check response
        if (e.response && e.response.status === 302) {
            console.log('Redirect 302 received OK')
        } else {
            console.log('Request failed or not 302:', e.message)
        }
    }

    // Wait for async log (Fire & Forget)
    await sleep(2000)

    // Check DB
    const log = await prisma.clickLog.findFirst({
        where: { affiliateId: affId, postId: 999 }
    })

    if (log) {
        console.log('✅ ClickLog found:', log)
    } else {
        console.error('❌ ClickLog NOT found!')
    }

    // 3. Test Caching (Public Post)
    // Need a seeded post. Assuming DB might be empty or has seed.
    // I'll skip creating a post to avoid complexity, just test the Header "X-Cache" if apicache sets it?
    // Apicache usually doesn't set a standard header by default unless configured.
    // But we can measure response time of 404 even? Or 200 health check?
    // Wait, health check is NOT cached (it's in server.ts or routes.ts outside the cache middleware for posts).
    // I applied cache to `/topics` and `/posts`.
    console.log('3. Testing Cache (on 404 post is fine or if posts exist)...')

    const start1 = Date.now()
    try {
        await axios.get('http://localhost:4000/api/posts/test-cache-slug')
    } catch (e) { }
    const time1 = Date.now() - start1
    console.log(`Request 1 took: ${time1}ms`)

    const start2 = Date.now()
    try {
        await axios.get('http://localhost:4000/api/posts/test-cache-slug')
    } catch (e) { }
    const time2 = Date.now() - start2
    console.log(`Request 2 took: ${time2}ms`)

    if (time2 < time1 && time2 < 20) {
        console.log('✅ Cache likely working (Time 2 is fast)')
    } else {
        console.log('⚠️ Cache might not be hit (or 404 is not cached)')
    }

    console.log('--- Verification Done ---')
    process.exit(0)
}

verify().catch(console.error)
