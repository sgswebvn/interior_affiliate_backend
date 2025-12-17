import { prisma } from '../../config/prisma'
import { slugify } from '../../utils/slugify'

export async function createPost(data: any) {
    const slug = slugify(data.title)

    return prisma.$transaction(async (tx) => {
        const post = await tx.post.create({
            data: {
                title: data.title,
                slug,
                excerpt: data.excerpt,
                content: data.content,
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
}
export async function updatePost(id: number, data: any) {
    return prisma.$transaction(async (tx) => {
        await tx.post.update({
            where: { id },
            data: {
                title: data.title,
                excerpt: data.excerpt,
                content: data.content,
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

        return true
    })
}
export async function deletePost(id: number) {
    return prisma.$transaction([
        prisma.postTag.deleteMany({ where: { postId: id } }),
        prisma.postAffiliate.deleteMany({ where: { postId: id } }),
        prisma.post.delete({ where: { id } }),
    ])
}
export async function getPostBySlug(slug: string) {
    return prisma.post.findFirst({
        where: {
            slug,
            publishedAt: { not: null },
        },
        include: {
            topic: true,
            tags: { include: { tag: true } },
            affiliates: { include: { affiliate: true } },
        },
    })
}
export async function getPostsByTopic(topicSlug: string) {
    return prisma.post.findMany({
        where: {
            topic: { slug: topicSlug },
            publishedAt: { not: null },
        },
        orderBy: { publishedAt: 'desc' },
        select: {
            title: true,
            slug: true,
            excerpt: true,
            publishedAt: true,
        },
    })
}
