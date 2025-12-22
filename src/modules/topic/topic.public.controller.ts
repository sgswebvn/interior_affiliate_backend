import { Request, Response } from 'express'
import { prisma } from '../../config/prisma'

export async function listPublicTopics(req: Request, res: Response) {
    const page = Math.max(Number(req.query.page) || 1, 1)
    const limit = Math.min(Number(req.query.limit) || 100, 200)
    const skip = (page - 1) * limit
    const search = req.query.search as string
    const hierarchy = req.query.hierarchy === 'true'

    const where: any = {
        status: 'PUBLISHED'
    }

    if (search) {
        where.name = { contains: search, mode: 'insensitive' }
    }

    if (hierarchy) {
        where.parentId = null // Only root topics
    }

    const [total, topics] = await Promise.all([
        prisma.topic.count({ where }),
        prisma.topic.findMany({
            where,
            skip,
            take: limit,
            include: hierarchy ? {
                children: {
                    where: { status: 'PUBLISHED' },
                    include: { children: { where: { status: 'PUBLISHED' } } }
                }
            } : undefined,
            orderBy: { name: 'asc' }
        }),
    ])

    res.json({ total, page, limit, data: topics })
}

export async function getTopicBySlug(req: Request, res: Response) {
    const { slug } = req.params
    const topic = await prisma.topic.findFirst({
        where: { slug, status: 'PUBLISHED' },
        include: {
            children: { where: { status: 'PUBLISHED' } },
            parent: true
        }
    })

    if (!topic) return res.status(404).json({ message: 'Topic not found' })
    res.json(topic)
}
