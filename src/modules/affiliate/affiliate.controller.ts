import { Request, Response } from 'express'
import { prisma } from '../../config/prisma'

export async function listAffiliates(req: Request, res: Response) {
    const page = Math.max(Number(req.query.page) || 1, 1)
    const limit = Math.min(Number(req.query.limit) || 50, 200)
    const skip = (page - 1) * limit

    const [total, affiliates] = await Promise.all([
        prisma.affiliate.count(),
        prisma.affiliate.findMany({ skip, take: limit, orderBy: { id: 'desc' } }),
    ])

    res.json({ total, page, limit, data: affiliates })
}

export async function createAffiliate(req: Request, res: Response) {
    const affiliate = await prisma.affiliate.create({
        data: req.body,
    })
    res.status(201).json(affiliate)
}

export async function redirectAffiliate(req: Request, res: Response) {
    const id = Number(req.params.affiliateId)

    const affiliate = await prisma.affiliate.findUnique({
        where: { id },
    })

    if (!affiliate) return res.status(404).end()

    // future: log click here
    res.redirect(affiliate.url)
}
