import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
    const email = 'admin@interior.com'
    const password = await bcrypt.hash('123456', 10)

    const exists = await prisma.admin.findUnique({ where: { email } })
    if (exists) return

    await prisma.admin.create({
        data: { email, password },
    })

    console.log('Admin seeded')
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
