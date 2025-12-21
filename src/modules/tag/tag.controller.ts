import { Request, Response } from 'express'
import { prisma } from '../../config/prisma'
import { slugify } from '../../utils/slugify'
import { ensureUniqueSlug } from '../../utils/uniqueSlug'

export async function listTags(req: Request, res: Response) {
    const page = Math.max(Number(req.query.page) || 1, 1)
    const limit = Math.min(Number(req.query.limit) || 50, 200)
    const skip = (page - 1) * limit

    // Explicitly cast to string to avoid lint error about unknown type
    const typeStr = req.query.type ? String(req.query.type) : undefined
    const where = typeStr ? { type: typeStr as any } : {}

    const [total, tags] = await Promise.all([
        prisma.tag.count({ where }),
        prisma.tag.findMany({
            where,
            skip,
            take: limit,
            orderBy: { name: 'asc' }
        }),
    ])

    res.json({ total, page, limit, data: tags })
}

export async function createTag(req: Request, res: Response) {
    const { name, type } = req.body

    const slugBase = slugify(name)
    const slug = await ensureUniqueSlug(prisma, 'tag', slugBase)

    const tag = await prisma.tag.create({ data: { name, slug, type } })

    res.status(201).json(tag)
}

export async function getTagById(req: Request, res: Response) {
    const id = Number(req.params.id)
    const tag = await prisma.tag.findUnique({ where: { id } })
    if (!tag) return res.status(404).json({ message: 'Tag not found' })
    res.json(tag)
}

export async function updateTag(req: Request, res: Response) {
    const id = Number(req.params.id)
    const { name, type } = req.body

    // Check if name changed to update slug
    let slug: string | undefined
    if (name) {
        const slugBase = slugify(name)
        slug = await ensureUniqueSlug(prisma, 'tag', slugBase, id)
    }

    const tag = await prisma.tag.update({
        where: { id },
        data: {
            name,
            type,
            ...(slug ? { slug } : {})
        }
    })
    res.json(tag)
}

export async function deleteTag(req: Request, res: Response) {
    const id = Number(req.params.id)
    try {
        await prisma.tag.delete({ where: { id } })
        res.json({ success: true })
    } catch (e) {
        res.status(400).json({ message: 'Cannot delete tag (in use)' })
    }
}
