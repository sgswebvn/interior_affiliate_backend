import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const listPublicProducts = async (req: Request, res: Response) => {
    try {
        const { topic, search, brand, minPrice, maxPrice, sort, limit, page } = req.query;
        const where: any = { status: 'PUBLISHED' };

        if (topic) {
            // Handle topic slug or ID
            const topicData = await prisma.topic.findUnique({ where: { slug: String(topic) } });
            if (topicData) {
                // Include children topics?
                const children = await prisma.topic.findMany({ where: { parentId: topicData.id } });
                const topicIds = [topicData.id, ...children.map(c => c.id)];
                where.topicId = { in: topicIds };
            }
        }

        if (brand) {
            const brandData = await prisma.brand.findUnique({ where: { slug: String(brand) } });
            if (brandData) where.brandId = brandData.id;
        }

        if (search) {
            where.name = { contains: String(search), mode: 'insensitive' };
        }

        const orderBy: any = {};
        if (sort === 'price_asc') orderBy.price = 'asc'; // Price is string, might sort weirdly. Ideally convert to number or sort by ID/Date.
        else if (sort === 'price_desc') orderBy.price = 'desc';
        else orderBy.createdAt = 'desc';

        const take = Number(limit) || 12;
        const skip = ((Number(page) || 1) - 1) * take;

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    topic: true,
                    brand: true
                },
                orderBy,
                take,
                skip
            }),
            prisma.product.count({ where })
        ]);

        res.json({
            data: products,
            pagination: {
                total,
                page: Number(page) || 1,
                limit: take,
                totalPages: Math.ceil(total / take)
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getProductBySlug = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        const product = await prisma.product.findUnique({
            where: { slug, status: 'PUBLISHED' },
            include: {
                topic: true,
                brand: true,
                comments: {
                    orderBy: { createdAt: 'desc' },
                    take: 20
                },
                // Fetch related products based on topic?
            }
        });

        if (!product) return res.status(404).json({ error: 'Product not found' });

        // Get related
        const related = await prisma.product.findMany({
            where: {
                topicId: product.topicId,
                id: { not: product.id },
                status: 'PUBLISHED'
            },
            take: 4
        });

        res.json({ ...product, related });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
