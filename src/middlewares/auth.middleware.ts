import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { jwtSecret } from '../config/jwt'

export function authenticate(req: Request, res: Response, next: NextFunction) {
    const auth = req.headers.authorization
    if (!auth) return res.status(401).json({ message: 'Unauthorized' })
    const [, token] = auth.split(' ')
    try {
        const payload = jwt.verify(token, jwtSecret)
            ; (req as any).user = payload
        next()
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' })
    }
}
