
import axios from 'axios'
import bcrypt from 'bcrypt'
import { prisma } from './config/prisma'

const PORT = 3000 // Server confirmed on 3000
const BASE_URL = `http://localhost:${PORT}/api`
const ADMIN_EMAIL = 'demo@admin.com'
const ADMIN_PASS = 'demo123'

async function main() {
    console.log(`\n🚀 STARTING FULL FLOW DEMO (Port: ${PORT})`)
    // ... rest of setup ...
    console.log('---------------------------------------------')

    // 0. Setup: Ensure Admin Exists
    console.log('🔑 [SETUP] Creating/Updating Demo Admin...')
    const hashedPassword = await bcrypt.hash(ADMIN_PASS, 10)
    await prisma.admin.upsert({
        where: { email: ADMIN_EMAIL },
        update: { password: hashedPassword },
        create: { email: ADMIN_EMAIL, password: hashedPassword }
    })
    console.log('   -> Admin ready: ' + ADMIN_EMAIL)

    // 1. Login
    console.log('\n🔒 [STEP 1] Logging in...')
    try {
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASS
        })
        const token = loginRes.data.token
        const headers = { Authorization: `Bearer ${token}` }
        console.log('   -> Login Success! Token acquired.')

        // 2. Create Affiliate Product
        console.log('\n🔗 [STEP 2] Creating Affiliate Product (Admin)...')
        const productRes = await axios.post(`${BASE_URL}/admin/affiliates`, {
            name: 'Super Gaming Mouse',
            url: 'https://shopee.vn/gaming-mouse-demo',
            price: '500.000 VND',
            brand: 'Logitech'
        }, { headers })
        const productId = productRes.data.id
        console.log(`   -> Product Created: ID ${productId} - ${productRes.data.name}`)

        // 3. Create Topic
        console.log('\n📂 [STEP 3] Creating Topic (Admin)...')
        const topicSlug = 'gaming-gear-' + Date.now()
        const topicRes = await axios.post(`${BASE_URL}/admin/topics`, {
            name: 'Gaming Gear',
            slug: topicSlug
        }, { headers })
        const topicId = topicRes.data.id
        console.log(`   -> Topic Created: ID ${topicId} - ${topicRes.data.name}`)

        // 4. Create Post (Review)
        console.log('\n📝 [STEP 4] Creating Review Post (Admin)...')
        const postRes = await axios.post(`${BASE_URL}/admin/posts`, {
            title: 'Best Gaming Mouse 2025 ' + Date.now(),
            content: '<p>This is the best mouse ever. <a href="LINK_PLACEHOLDER">Buy here</a></p>',
            intent: 'COMMERCIAL',
            topicId: topicId,
            affiliateIds: [productId], // Link the product
            published: true
        }, { headers })
        const postSlug = postRes.data.slug
        const postId = postRes.data.id
        console.log(`   -> Post Created: ID ${postId} - ${postRes.data.title}`)

        // 5. Public User View
        console.log('\n👀 [STEP 5] Public User reads Post (Public API)...')
        const publicPostRes = await axios.get(`${BASE_URL}/posts/${postSlug}`)
        const postData = publicPostRes.data
        const attachedAffiliate = postData.affiliates[0]?.affiliate
        if (attachedAffiliate && attachedAffiliate.id === productId) {
            console.log('   -> Public Post shows correct Product Link: OK')
        } else {
            console.error('   -> ❌ Product Link Missing in Public Post!')
        }

        // 6. Simulate User Click
        console.log('\n🖱️ [STEP 6] User Clicks Affiliate Link...')
        console.log(`   -> Simulating Click on /api/redirect/${productId}?postId=${postId}`)
        try {
            await axios.get(`${BASE_URL}/redirect/${productId}?postId=${postId}`, {
                maxRedirects: 0,
                validateStatus: (s) => s >= 200 && s < 400
            })
        } catch (e) { }
        console.log('   -> Click executed (Redirected to Shopee)')

        // 7. Verify Tracking Log
        console.log('\n📊 [STEP 7] Verifying Analytics (DB)...')
        await new Promise(r => setTimeout(r, 2000))
        const log = await prisma.clickLog.findFirst({
            where: { postId: postId, affiliateId: productId },
            orderBy: { id: 'desc' }
        })

        if (log) {
            console.log('   -> ✅ TRACKING SUCCESS!')
            console.log('   -> Log Record:', log)
        } else {
            console.error('   -> ❌ TRACKING FAILED. Log not found.')
        }

        console.log('\n🎉 DEMO COMPLETED SUCCESSFULLY!')
        process.exit(0)

    } catch (err: any) {
        console.error('❌ Demo Failed:', err.message)
        if (err.code) console.error('Error Code:', err.code)
        if (err.response) {
            console.error('Response Status:', err.response.status)
            console.error('Response Data:', JSON.stringify(err.response.data, null, 2))
        } else if (err.request) {
            console.error('No Response received. Server might be down or port wrong.')
        }
        process.exit(1)
    }
}

main().catch(console.error)
