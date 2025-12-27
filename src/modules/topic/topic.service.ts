import { prisma } from '../../config/prisma'
import { slugify } from '../../utils/slugify'
import { AppError } from '../../utils/AppError'
import { Prisma } from '@prisma/client'

export class TopicService {

    // --- QUERY ---

    static async findAll(query: any) {
        const page = Math.max(Number(query.page) || 1, 1)
        const limit = Math.min(Number(query.limit) || 100, 200)
        const skip = (page - 1) * limit
        const search = query.search as string
        const hierarchy = query.hierarchy === 'true'
        const isPublic = query.isPublic === true

        const where: Prisma.TopicWhereInput = {}

        if (search) {
            where.name = { contains: search, mode: 'insensitive' }
        }

        if (isPublic) {
            where.status = 'PUBLISHED'
        }

        if (hierarchy) {
            where.parentId = null
        }

        const include: Prisma.TopicInclude = hierarchy ? {
            parent: true, // Need parent info?
            children: {
                where: isPublic ? { status: 'PUBLISHED' } : undefined,
                include: {
                    children: {
                        where: isPublic ? { status: 'PUBLISHED' } : undefined
                    }
                }
            }
        } : {
            parent: true,
            children: true
        }

        const [total, topics] = await Promise.all([
            prisma.topic.count({ where }),
            prisma.topic.findMany({
                where,
                skip,
                take: limit,
                orderBy: { id: 'asc' }, // Or name? Keep ID for admin, Name for public logic override maybe?
                include
            }),
        ])

        return { total, page, limit, data: topics }
    }

    static async findById(id: number) {
        const topic = await prisma.topic.findUnique({
            where: { id },
            include: { parent: true, children: true }
        })
        if (!topic) throw new AppError('Topic not found', 404)
        return topic
    }

    static async findBySlug(slug: string) {
        const topic = await prisma.topic.findFirst({
            where: { slug, status: 'PUBLISHED' },
            include: {
                children: { where: { status: 'PUBLISHED' } },
                parent: true
            }
        })
        if (!topic) throw new AppError('Topic not found', 404)
        return topic
    }

    // --- MUTATION ---

    static async create(data: { name: string, parentId?: number, slug?: string, status?: any, image?: string }) {
        const slugToUse = data.slug ? slugify(data.slug) : slugify(data.name);

        // Check duplication
        const existing = await prisma.topic.findUnique({ where: { slug: slugToUse } })
        if (existing) throw new AppError('Slug already exists', 409)

        return prisma.topic.create({
            data: {
                name: data.name,
                slug: slugToUse,
                status: data.status || 'PUBLISHED',
                image: data.image,
                parentId: data.parentId && Number(data.parentId) > 0 ? Number(data.parentId) : null
            }
        })
    }

    static async update(id: number, data: { name?: string, parentId?: number, slug?: string, status?: any, image?: string }) {
        const topic = await prisma.topic.findUnique({ where: { id } })
        if (!topic) throw new AppError('Topic not found', 404)

        const updateData: any = { ...data }

        if (data.parentId !== undefined) {
            updateData.parentId = data.parentId && Number(data.parentId) > 0 ? Number(data.parentId) : null;
        }

        if (data.slug) {
            updateData.slug = slugify(data.slug)
        } else if (data.name && !topic.slug) {
            // Optional: auto-update slug on name change? Usually dangerous for SEO. Keep manual unless requested.
        }

        return prisma.topic.update({
            where: { id },
            data: updateData
        })
    }

    static async delete(id: number) {
        // Validation: Check usage
        const postsCount = await prisma.post.count({ where: { topicId: id } })
        if (postsCount > 0) throw new AppError('Cannot delete topic with existing posts', 400)

        const childrenCount = await prisma.topic.count({ where: { parentId: id } })
        if (childrenCount > 0) throw new AppError('Cannot delete topic that has sub-topics', 400)

        return prisma.topic.delete({ where: { id } })
    }
}
