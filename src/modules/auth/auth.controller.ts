import { Request, Response } from 'express'
import { login } from './auth.service'

export async function loginController(req: Request, res: Response) {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ message: 'Missing credentials' })
    }

    const token = await login(email, password)
    res.json({ token })
}
