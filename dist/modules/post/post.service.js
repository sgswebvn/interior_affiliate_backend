"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPost = createPost;
exports.updatePost = updatePost;
exports.deletePost = deletePost;
exports.getPostBySlug = getPostBySlug;
exports.getPostsByTopic = getPostsByTopic;
const prisma_1 = require("../../config/prisma");
const slugify_1 = require("../../utils/slugify");
async function createPost(data) {
    const slug = (0, slugify_1.slugify)(data.title);
    return prisma_1.prisma.$transaction(async (tx) => {
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
        });
        if (data.tagIds?.length) {
            await tx.postTag.createMany({
                data: data.tagIds.map((tagId) => ({
                    postId: post.id,
                    tagId,
                })),
            });
        }
        if (data.affiliateIds?.length) {
            await tx.postAffiliate.createMany({
                data: data.affiliateIds.map((affiliateId) => ({
                    postId: post.id,
                    affiliateId,
                })),
            });
        }
        return post;
    });
}
async function updatePost(id, data) {
    return prisma_1.prisma.$transaction(async (tx) => {
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
        });
        await tx.postTag.deleteMany({ where: { postId: id } });
        await tx.postAffiliate.deleteMany({ where: { postId: id } });
        if (data.tagIds?.length) {
            await tx.postTag.createMany({
                data: data.tagIds.map((tagId) => ({
                    postId: id,
                    tagId,
                })),
            });
        }
        if (data.affiliateIds?.length) {
            await tx.postAffiliate.createMany({
                data: data.affiliateIds.map((affiliateId) => ({
                    postId: id,
                    affiliateId,
                })),
            });
        }
        return true;
    });
}
async function deletePost(id) {
    return prisma_1.prisma.$transaction([
        prisma_1.prisma.postTag.deleteMany({ where: { postId: id } }),
        prisma_1.prisma.postAffiliate.deleteMany({ where: { postId: id } }),
        prisma_1.prisma.post.delete({ where: { id } }),
    ]);
}
async function getPostBySlug(slug) {
    return prisma_1.prisma.post.findFirst({
        where: {
            slug,
            publishedAt: { not: null },
        },
        include: {
            topic: true,
            tags: { include: { tag: true } },
            affiliates: { include: { affiliate: true } },
        },
    });
}
async function getPostsByTopic(topicSlug) {
    return prisma_1.prisma.post.findMany({
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
    });
}
