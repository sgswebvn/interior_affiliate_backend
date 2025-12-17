import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prisma } from '../../config/prisma'
import { jwtSecret, jwtExpiresIn } from '../../config/jwt'

export async function login(email: string, password: string) {
    const admin = await prisma.admin.findUnique({ where: { email } })
    if (!admin) throw new Error('Invalid credentials')

    const ok = await bcrypt.compare(password, admin.password)
    if (!ok) throw new Error('Invalid credentials')

    const token = jwt.sign(
        { id: admin.id, email: admin.email },
        jwtSecret,
        { expiresIn: jwtExpiresIn }
    )

    return token
}
