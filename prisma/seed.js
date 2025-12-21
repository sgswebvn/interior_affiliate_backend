const bcrypt = require('bcrypt')
const { PrismaClient } = require('@prisma/client')
const dotenv = require('dotenv')

dotenv.config({ path: '../.env' })

const prisma = new PrismaClient()

async function main() {
    const email = process.env.ADMIN_EMAIL || 'admin@interior.com'
    const password = process.env.ADMIN_PASSWORD || '123456'

    const exists = await prisma.admin.findUnique({ where: { email } })
    if (exists) {
        console.log('Admin already exists')
        return
    }

    const hash = await bcrypt.hash(password, 10)
    await prisma.admin.create({ data: { email, password: hash } })
    console.log('Admin seeded')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())
