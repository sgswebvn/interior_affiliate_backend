import { prisma } from '../../config/prisma'
import { slugify } from '../../utils/slugify'
import { ensureUniqueSlug } from '../../utils/uniqueSlug'
import sanitizeHtml from 'sanitize-html'
import { Prisma } from '@prisma/client'
import { AppError } from '../../utils/AppError'

export class PostService {

    static async findAll(query: any) {
        const page = Math.max(Number(query.page) || 1, 1)
        const limit = Math.min(Number(query.limit) || 20, 100)
        const skip = (page - 1) * limit
        const search = query.search as string
        const topicId = query.topicId ? Number(query.topicId) : undefined
        const isPublic = query.isPublic === true

        const where: Prisma.PostWhereInput = {}

        if (search) {
            where.title = { contains: search, mode: 'insensitive' }
        }

        if (topicId) {
            where.topicId = topicId
        }

        if (isPublic) {
            where.publishedAt = { not: null }
            where.status = 'PUBLISHED'
        }

        const [total, posts] = await Promise.all([
            prisma.post.count({ where }),
            prisma.post.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    topic: true,
                    tags: { include: { tag: true } },
                    // affiliates: { include: { affiliate: true } } // Heavily increases payload, maybe detailed view only?
                },
            }),
        ])

        return { total, page, limit, data: posts }
    }

    static async findById(id: number) {
        const post = await prisma.post.findUnique({
            where: { id },
            include: {
                topic: true,
                tags: { include: { tag: true } },
                affiliates: { include: { affiliate: true } },
            },
        })
        if (!post) throw new AppError('Post not found', 404)
        return post
    }

    static async findBySlug(slug: string) {
        const post = await prisma.post.findFirst({
            where: {
                slug,
                publishedAt: { not: null }, // Only public usually calls this?
            },
            include: {
                topic: true,
                tags: { include: { tag: true } },
                affiliates: { include: { affiliate: true } },
            },
        })
        if (!post) throw new AppError('Post not found', 404)
        return post
    }

    static async create(data: any) {
        const slugBase = data.slug ? slugify(data.slug) : slugify(data.title)

        return prisma.$transaction(async (tx) => {
            const slug = await ensureUniqueSlug(tx, 'post', slugBase)

            const content = data.content ? sanitizeHtml(data.content, {
                allowedTags: ['p', 'a', 'ul', 'ol', 'li', 'strong', 'em', 'img', 'h1', 'h2', 'h3', 'blockquote', 'div', 'span', 'br'],
                allowedAttributes: {
                    a: ['href', 'rel', 'target'],
                    img: ['src', 'alt', 'width', 'height'],
                    div: ['class', 'style'],
                    span: ['class', 'style']
                },
            }) : ''

            const post = await tx.post.create({
                data: {
                    title: data.title,
                    slug,
                    excerpt: data.excerpt,
                    content,
                    intent: data.intent,
                    topicId: Number(data.topicId),
                    thumbnail: data.thumbnail,
                    status: data.status || 'DRAFT',
                    publishedAt: data.published ? new Date() : null,
                },
            })

            if (data.tagIds?.length) {
                await tx.postTag.createMany({
                    data: data.tagIds.map((tagId: number) => ({
                        postId: post.id,
                        tagId,
                    })),
                })
            }

            if (data.affiliateIds?.length) {
                await tx.postAffiliate.createMany({
                    data: data.affiliateIds.map((affiliateId: number) => ({
                        postId: post.id,
                        affiliateId,
                    })),
                })
            }

            return post
        })
    }

    static async update(id: number, data: any) {
        return prisma.$transaction(async (tx) => {
            const existing = await tx.post.findUnique({ where: { id } })
            if (!existing) throw new AppError('Post not found', 404)

            let slug = undefined
            if (data.slug && data.slug !== existing.slug) {
                slug = await ensureUniqueSlug(tx, 'post', slugify(data.slug), id)
            } else if (data.title && !data.slug) {
                // Determine if we should auto-update slug. Usually NO for SEO stability.
            }

            let content = undefined
            if (data.content !== undefined) {
                content = sanitizeHtml(data.content, {
                    allowedTags: ['p', 'a', 'ul', 'ol', 'li', 'strong', 'em', 'img', 'h1', 'h2', 'h3', 'blockquote', 'div', 'span', 'br'],
                    allowedAttributes: {
                        a: ['href', 'rel', 'target'],
                        img: ['src', 'alt', 'width', 'height'],
                        div: ['class', 'style'],
                        span: ['class', 'style']
                    },
                })
            }

            const updateData: any = {
                title: data.title,
                excerpt: data.excerpt,
                intent: data.intent,
                topicId: data.topicId ? Number(data.topicId) : undefined,
                thumbnail: data.thumbnail,
                status: data.status,
            }

            if (slug) updateData.slug = slug
            if (content !== undefined) updateData.content = content
            if (data.published === true) updateData.publishedAt = new Date()
            if (data.published === false) updateData.publishedAt = null

            // Clean undefined
            Object.keys(updateData).forEach(key => (updateData as any)[key] === undefined && delete (updateData as any)[key])

            const post = await tx.post.update({
                where: { id },
                data: updateData as Prisma.PostUpdateInput
            })

            // Tags
            if (data.tagIds) {
                await tx.postTag.deleteMany({ where: { postId: id } })
                if (data.tagIds.length) {
                    await tx.postTag.createMany({
                        data: data.tagIds.map((tagId: number) => ({ postId: id, tagId })),
                    })
                }
            }

            // Affiliates
            if (data.affiliateIds) {
                await tx.postAffiliate.deleteMany({ where: { postId: id } })
                if (data.affiliateIds.length) {
                    await tx.postAffiliate.createMany({
                        data: data.affiliateIds.map((affiliateId: number) => ({ postId: id, affiliateId })),
                    })
                }
            }

            return post
        })
    }

    static async delete(id: number) {
        return prisma.$transaction([
            prisma.postTag.deleteMany({ where: { postId: id } }),
            prisma.postAffiliate.deleteMany({ where: { postId: id } }),
            prisma.post.delete({ where: { id } }),
        ])
    }
}
