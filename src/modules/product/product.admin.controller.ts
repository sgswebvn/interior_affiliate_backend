import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { slugify } from '../../utils/slugify';

const prisma = new PrismaClient();

export const listProducts = async (req: Request, res: Response) => {
    try {
        const { search, topicId, status, brandId } = req.query;
        const where: any = {};

        if (search) {
            where.name = { contains: String(search), mode: 'insensitive' };
        }
        if (topicId) where.topicId = Number(topicId);
        if (brandId) where.brandId = Number(brandId);
        if (status) where.status = String(status);

        const products = await prisma.product.findMany({
            where,
            include: {
                topic: true,
                brand: true,
                _count: { select: { comments: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ data: products });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const product = await prisma.product.findUnique({
            where: { id: Number(id) },
            include: {
                topic: true,
                brand: true
            }
        });
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createProduct = async (req: Request, res: Response) => {
    try {
        const { name, price, originalPrice, description, images, affiliateLink, specs, topicId, brandId, status } = req.body;

        const slug = slugify(name);

        // Ensure unique slug
        const existing = await prisma.product.findFirst({ where: { slug } });
        const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

        const product = await prisma.product.create({
            data: {
                name,
                slug: finalSlug,
                price,
                originalPrice,
                description,
                images: images || [],
                affiliateLink,
                specs: specs || {},
                topicId: Number(topicId),
                brandId: brandId ? Number(brandId) : null,
                status: status || 'PUBLISHED'
            }
        });

        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create product' });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, price, originalPrice, description, images, affiliateLink, specs, topicId, brandId, status } = req.body;

        // Verify existence
        const existing = await prisma.product.findUnique({ where: { id: Number(id) } });
        if (!existing) return res.status(404).json({ error: 'Product not found' });

        // Update slug if name changes? Maybe keep it stable for SEO. 
        // Only update if requested explicitly or handle redirection?
        // Current logic: usually don't update slug unless needed. Let's keep slug stable for now or update if name changed drastically.
        // For simplicity, let's NOT update slug on edit to preserve SEO.

        const product = await prisma.product.update({
            where: { id: Number(id) },
            data: {
                name,
                price,
                originalPrice,
                description,
                images,
                affiliateLink,
                specs,
                topicId: Number(topicId),
                brandId: brandId ? Number(brandId) : null,
                status
            }
        });

        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update product' });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.product.delete({ where: { id: Number(id) } });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete product' });
    }
};
