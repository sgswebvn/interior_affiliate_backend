import { Request, Response } from 'express'
import { prisma } from '../../config/prisma'
import { slugify } from '../../utils/slugify'
import { ensureUniqueSlug } from '../../utils/uniqueSlug'

export async function listTags(req: Request, res: Response) {
    const page = Math.max(Number(req.query.page) || 1, 1)
    const limit = Math.min(Number(req.query.limit) || 50, 200)
    const skip = (page - 1) * limit

    const [total, tags] = await Promise.all([
        prisma.tag.count(),
        prisma.tag.findMany({ skip, take: limit, orderBy: { name: 'asc' } }),
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
