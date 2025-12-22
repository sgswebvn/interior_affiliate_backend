import { Request, Response } from 'express'
import { prisma } from '../../config/prisma'
import logger from '../../config/logger'

export async function listAffiliates(req: Request, res: Response) {
    const page = Math.max(Number(req.query.page) || 1, 1)
    const limit = Math.min(Number(req.query.limit) || 50, 200)
    const skip = (page - 1) * limit
    const search = req.query.search as string
    const brand = req.query.brand as string

    const where: any = {}

    if (search) {
        where.name = { contains: search, mode: 'insensitive' }
    }

    if (brand) {
        where.brand = brand
    }

    const [total, affiliates] = await Promise.all([
        prisma.affiliate.count({ where }),
        prisma.affiliate.findMany({ where, skip, take: limit, orderBy: { id: 'desc' } }),
    ])

    res.json({ total, page, limit, data: affiliates })
}

export async function createAffiliate(req: Request, res: Response) {
    const { name, brand, brandId, price, image, url, status } = req.body
    const affiliate = await prisma.affiliate.create({
        data: {
            name, brand, brandId: brandId ? Number(brandId) : null, price, image, url, status: status || 'PUBLISHED'
        },
    })
    res.status(201).json(affiliate)
}

export async function redirectAffiliate(req: Request, res: Response) {
    const id = Number(req.params.affiliateId)
    const postId = req.query.postId ? Number(req.query.postId) : null

    const affiliate = await prisma.affiliate.findUnique({
        where: { id },
    })

    if (!affiliate) return res.status(404).end()
    // if (affiliate.status !== 'PUBLISHED') return res.status(404).end() // Optional: Block private links?

    // Tracking (Fire & Forget)
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress
    const userAgent = req.headers['user-agent']

    prisma.clickLog.create({
        data: {
            affiliateId: id,
            postId: postId,
            url: affiliate.url,
            ip: String(ip),
            userAgent: userAgent,
        }
    }).catch(err => logger.error('Click logging failed', err))

    res.redirect(affiliate.url)
}

export async function getAffiliateById(req: Request, res: Response) {
    const id = Number(req.params.id)
    const affiliate = await prisma.affiliate.findUnique({ where: { id } })
    if (!affiliate) return res.status(404).json({ message: 'Affiliate not found' })
    res.json(affiliate)
}

export async function updateAffiliate(req: Request, res: Response) {
    const id = Number(req.params.id)
    const { name, brand, brandId, price, image, url, status } = req.body;

    // Explicit update to prevent unwanted field injection
    const data: any = {};
    if (name) data.name = name;
    if (brand !== undefined) data.brand = brand;
    if (brandId !== undefined) data.brandId = brandId ? Number(brandId) : null;
    if (price !== undefined) data.price = price;
    if (image !== undefined) data.image = image;
    if (url) data.url = url;
    if (status) data.status = status;

    const affiliate = await prisma.affiliate.update({
        where: { id },
        data,
    })
    res.json(affiliate)
}

