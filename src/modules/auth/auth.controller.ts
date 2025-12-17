import { Request, Response } from 'express'
import { login } from './auth.service'

// Re-export the service login to keep compatibility with imports that
// (incorrectly) import it from this controller file.
export { login }

export async function loginController(req: Request, res: Response) {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ message: 'Missing credentials' })
    }

    const token = await login(email, password)
    res.json({ token })
}
