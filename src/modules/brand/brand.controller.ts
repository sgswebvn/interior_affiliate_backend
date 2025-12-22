import { Request, Response } from 'express'
import { prisma } from '../../config/prisma'
import { slugify } from '../../utils/slugify'
import { ensureUniqueSlug } from '../../utils/uniqueSlug'

export async function listBrands(req: Request, res: Response) {
    const page = Math.max(Number(req.query.page) || 1, 1)
    const limit = Math.min(Number(req.query.limit) || 100, 200)
    const skip = (page - 1) * limit
    const search = req.query.search as string

    const where: any = {}
    if (search) {
        where.name = { contains: search, mode: 'insensitive' }
    }

    const [total, brands] = await Promise.all([
        prisma.brand.count({ where }),
        prisma.brand.findMany({
            where,
            skip,
            take: limit,
            orderBy: { name: 'asc' },
            include: { _count: { select: { affiliates: true } } }
        }),
    ])

    res.json({ total, page, limit, data: brands })
}

export async function createBrand(req: Request, res: Response) {
    try {
        const { name, description, logo, status } = req.body
        const slugBase = slugify(name)
        const slug = await ensureUniqueSlug(prisma, 'brand', slugBase)

        const brand = await prisma.brand.create({
            data: {
                name,
                slug,
                description,
                logo,
                status: status || 'PUBLISHED'
            }
        })
        res.status(201).json(brand)
    } catch (e) {
        console.error(e)
        res.status(500).json({ error: 'Failed to create brand' })
    }
}

export async function getBrandById(req: Request, res: Response) {
    const id = Number(req.params.id)
    const brand = await prisma.brand.findUnique({ where: { id } })
    if (!brand) return res.status(404).json({ message: 'Brand not found' })
    res.json(brand)
}

export async function updateBrand(req: Request, res: Response) {
    try {
        const id = Number(req.params.id)
        const { name, description, logo, status } = req.body

        const data: any = {}
        if (name) {
            data.name = name
            // Optionally update slug if name changes, or logic to keep slug stable
            // data.slug = slugify(name) 
        }
        if (description !== undefined) data.description = description
        if (logo !== undefined) data.logo = logo
        if (status) data.status = status

        const brand = await prisma.brand.update({
            where: { id },
            data
        })
        res.json(brand)
    } catch (e) {
        res.status(500).json({ error: 'Failed to update brand' })
    }
}

export async function deleteBrand(req: Request, res: Response) {
    const id = Number(req.params.id)
    try {
        await prisma.brand.delete({ where: { id } })
        res.json({ success: true })
    } catch (e) {
        res.status(400).json({ message: 'Cannot delete brand (in use)' })
    }
}
