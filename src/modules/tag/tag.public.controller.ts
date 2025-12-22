import { Request, Response } from 'express'
import { prisma } from '../../config/prisma'

export async function listPublicTags(req: Request, res: Response) {
    try {
        const tags = await prisma.tag.findMany({
            orderBy: { name: 'asc' },
            select: { id: true, name: true, slug: true, _count: { select: { posts: true } } }
        })
        res.json({ data: tags })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Error fetching tags' })
    }
}
