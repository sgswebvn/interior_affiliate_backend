import { Request, Response } from 'express'
import { prisma } from '../../config/prisma'
import { slugify } from '../../utils/slugify'
import sanitizeHtml from 'sanitize-html'
import { ensureUniqueSlug } from '../../utils/uniqueSlug'

export async function adminListPosts(req: Request, res: Response) {
    const page = Math.max(Number(req.query.page) || 1, 1)
    const limit = Math.min(Number(req.query.limit) || 20, 100)
    const skip = (page - 1) * limit

    const [total, posts] = await Promise.all([
        prisma.post.count(),
        prisma.post.findMany({
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                topic: true,
                tags: { include: { tag: true } },
            },
        }),
    ])

    res.json({ total, page, limit, data: posts })
}

export async function createPost(req: Request, res: Response) {
    const data = req.body
    const slugBase = slugify(data.title)

    const post = await prisma.$transaction(async (tx: any) => {
        const slug = await ensureUniqueSlug(tx, 'post', slugBase)
        const content = data.content ? sanitizeHtml(data.content, {
            allowedTags: ['p', 'a', 'ul', 'ol', 'li', 'strong', 'em', 'img', 'h1', 'h2', 'h3', 'blockquote'],
            allowedAttributes: {
                a: ['href', 'rel', 'target'],
                img: ['src', 'alt'],
            },
        }) : null

        const post = await tx.post.create({
            data: {
                title: data.title,
                slug,
                excerpt: data.excerpt,
                content,
                intent: data.intent,
                topicId: data.topicId,
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

    res.status(201).json(post)
}

export async function updatePost(req: Request, res: Response) {
    const id = Number(req.params.id)
    const data = req.body

    await prisma.$transaction(async (tx: any) => {
        let slug: string | undefined = undefined
        if (data.title) {
            const slugBase = slugify(data.title)
            slug = await ensureUniqueSlug(tx, 'post', slugBase, id)
        }

        const content = data.content ? sanitizeHtml(data.content, {
            allowedTags: ['p', 'a', 'ul', 'ol', 'li', 'strong', 'em', 'img', 'h1', 'h2', 'h3', 'blockquote'],
            allowedAttributes: { a: ['href', 'rel', 'target'], img: ['src', 'alt'] },
        }) : null

        await tx.post.update({
            where: { id },
            data: {
                ...(data.title ? { title: data.title } : {}),
                ...(slug ? { slug } : {}),
                excerpt: data.excerpt,
                content,
                intent: data.intent,
                topicId: data.topicId,
                publishedAt: data.published ? new Date() : null,
            },
        })

        await tx.postTag.deleteMany({ where: { postId: id } })
        await tx.postAffiliate.deleteMany({ where: { postId: id } })

        if (data.tagIds?.length) {
            await tx.postTag.createMany({
                data: data.tagIds.map((tagId: number) => ({
                    postId: id,
                    tagId,
                })),
            })
        }

        if (data.affiliateIds?.length) {
            await tx.postAffiliate.createMany({
                data: data.affiliateIds.map((affiliateId: number) => ({
                    postId: id,
                    affiliateId,
                })),
            })
        }
    })

    res.json({ success: true })
}

export async function deletePost(req: Request, res: Response) {
    const id = Number(req.params.id)

    await prisma.$transaction([
        prisma.postTag.deleteMany({ where: { postId: id } }),
        prisma.postAffiliate.deleteMany({ where: { postId: id } }),
        prisma.post.delete({ where: { id } }),
    ])

    res.json({ success: true })
}

export async function getPostById(req: Request, res: Response) {
    const id = Number(req.params.id)
    const post = await prisma.post.findUnique({
        where: { id },
        include: {
            topic: true,
            tags: { include: { tag: true } },
            affiliates: { include: { affiliate: true } },
        },
    })

    if (!post) {
        return res.status(404).json({ message: 'Post not found' })
    }

    res.json(post)
}
