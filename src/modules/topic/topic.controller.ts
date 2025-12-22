import { Request, Response } from 'express'
import { prisma } from '../../config/prisma'
import { slugify } from '../../utils/slugify'
import { ensureUniqueSlug } from '../../utils/uniqueSlug'

export async function listTopics(req: Request, res: Response) {
    const page = Math.max(Number(req.query.page) || 1, 1)
    const limit = Math.min(Number(req.query.limit) || 100, 200)
    const skip = (page - 1) * limit
    const search = req.query.search as string
    const hierarchy = req.query.hierarchy === 'true' // If true, return tree structure (only roots)

    const where: any = {}
    if (search) {
        where.name = { contains: search, mode: 'insensitive' }
    }

    // If hierarchy requested, fetch only roots
    if (hierarchy) {
        where.parentId = null
    }

    const [total, topics] = await Promise.all([
        prisma.topic.count({ where }),
        prisma.topic.findMany({
            where,
            skip,
            take: limit,
            orderBy: { id: 'asc' },
            include: {
                parent: true,
                children: {
                    include: { children: true } // Support 3 levels deep per user request
                }
            }
        }),
    ])

    res.json({ total, page, limit, data: topics })
}

export async function createTopic(req: Request, res: Response) {
    try {
        const { name, parentId, slug, status } = req.body
        const slugToUse = slug ? slugify(slug) : slugify(name);

        // TODO: Handle slug uniqueness error

        const topic = await prisma.topic.create({
            data: {
                name,
                slug: slugToUse,
                status: status || 'PUBLISHED',
                parentId: parentId || null
            }
        })
        res.json(topic)
    } catch (error) {
        res.status(500).json({ error: 'Failed' })
    }
}

export const updateTopic = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, parentId, slug, status } = req.body;

        const data: any = { name };
        if (parentId !== undefined) data.parentId = parentId;
        if (status) data.status = status;
        if (slug) data.slug = slugify(slug);

        const topic = await prisma.topic.update({
            where: { id: Number(id) },
            data
        })
        res.json(topic)
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed' })
    }
}

export async function getTopicById(req: Request, res: Response) {
    const id = Number(req.params.id)
    const topic = await prisma.topic.findUnique({
        where: { id },
        include: { parent: true, children: true }
    })
    if (!topic) return res.status(404).json({ message: 'Topic not found' })
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
