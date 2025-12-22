import { Request, Response } from 'express'
import { prisma } from '../../config/prisma'

export async function getPostBySlug(req: Request, res: Response) {
    const { slug } = req.params

    const post = await prisma.post.findFirst({
        where: {
            slug,
            publishedAt: { not: null },
        },
        include: {
            topic: true,
            tags: { include: { tag: true } },
            affiliates: { include: { affiliate: true } },
        },
    })

    if (!post) return res.status(404).json({ message: 'Not found' })
    res.json(post)
}

export async function getPostsByTopic(req: Request, res: Response) {
    const { topicSlug } = req.params

    const page = Math.max(Number(req.query.page) || 1, 1)
    const limit = Math.min(Number(req.query.limit) || 20, 100)
    const skip = (page - 1) * limit

    const [total, posts] = await Promise.all([
        prisma.post.count({ where: { topic: { slug: topicSlug }, publishedAt: { not: null } } }),
        prisma.post.findMany({
            where: { topic: { slug: topicSlug }, publishedAt: { not: null } },
            orderBy: { publishedAt: 'desc' },
            select: { id: true, title: true, slug: true, excerpt: true, publishedAt: true },
            skip,
            take: limit,
        }),
    ])

    res.json({ total, page, limit, data: posts })
}

export async function listPosts(req: Request, res: Response) {
    const page = Math.max(Number(req.query.page) || 1, 1)
    const limit = Math.min(Number(req.query.limit) || 12, 50)
    const skip = (page - 1) * limit
    const search = req.query.search as string

    const where: any = {
        publishedAt: { not: null }
    }

    if (search) {
        where.title = { contains: search, mode: 'insensitive' }
    }

    const [total, posts] = await Promise.all([
        prisma.post.count({ where }),
        prisma.post.findMany({
            where,
            orderBy: { publishedAt: 'desc' },
            select: {
                id: true,
                title: true,
                slug: true,
                excerpt: true,
                publishedAt: true,
                thumbnail: true,
                topic: { select: { name: true, slug: true } }
            },
            skip,
            take: limit,
        }),
    ])

    res.json({ total, page, limit, data: posts })
}
