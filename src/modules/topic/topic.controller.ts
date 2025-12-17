import { Request, Response } from 'express'
import { prisma } from '../../config/prisma'
import { slugify } from '../../utils/slugify'
import { ensureUniqueSlug } from '../../utils/uniqueSlug'

export async function listTopics(req: Request, res: Response) {
    const page = Math.max(Number(req.query.page) || 1, 1)
    const limit = Math.min(Number(req.query.limit) || 50, 200)
    const skip = (page - 1) * limit

    const [total, topics] = await Promise.all([
        prisma.topic.count(),
        prisma.topic.findMany({ skip, take: limit, orderBy: { id: 'asc' } }),
    ])

    res.json({ total, page, limit, data: topics })
}

export async function createTopic(req: Request, res: Response) {
    const { name, seoTitle, seoDesc } = req.body

    const slugBase = slugify(name)
    const slug = await ensureUniqueSlug(prisma, 'topic', slugBase)

    const topic = await prisma.topic.create({
        data: { name, slug, seoTitle, seoDesc },
    })

    res.status(201).json(topic)
}
