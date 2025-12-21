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

export async function getTopicById(req: Request, res: Response) {
    const id = Number(req.params.id)
    const topic = await prisma.topic.findUnique({ where: { id } })
    if (!topic) return res.status(404).json({ message: 'Topic not found' })
    res.json(topic)
}

export async function updateTopic(req: Request, res: Response) {
    const id = Number(req.params.id)
    const { name, seoTitle, seoDesc } = req.body

    // Ensure unique slug if name changes (optional, or keep slug stable)
    // For simplicity, we update slug if name changes
    let slug: string | undefined
    if (name) {
        const slugBase = slugify(name)
        slug = await ensureUniqueSlug(prisma, 'topic', slugBase, id)
    }

    const topic = await prisma.topic.update({
        where: { id },
        data: {
            name,
            ...(slug ? { slug } : {}),
            seoTitle,
            seoDesc,
        },
    })
    res.json(topic)
}

export async function deleteTopic(req: Request, res: Response) {
    const id = Number(req.params.id)
    // Optional: check for posts before deleting or allow cascade
    try {
        await prisma.topic.delete({ where: { id } })
        res.json({ success: true })
    } catch (e) {
        // likely foreign key constraint
        res.status(400).json({ message: 'Cannot delete topic with existing posts' })
    }
}
