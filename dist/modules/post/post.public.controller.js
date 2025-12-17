"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPostBySlug = getPostBySlug;
exports.getPostsByTopic = getPostsByTopic;
const prisma_1 = require("../../config/prisma");
async function getPostBySlug(req, res) {
    const { slug } = req.params;
    const post = await prisma_1.prisma.post.findFirst({
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
    if (!post)
        return res.status(404).json({ message: 'Not found' });
    res.json(post);
}
async function getPostsByTopic(req, res) {
    const { topicSlug } = req.params;
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;
    const [total, posts] = await Promise.all([
        prisma_1.prisma.post.count({ where: { topic: { slug: topicSlug }, publishedAt: { not: null } } }),
        prisma_1.prisma.post.findMany({
            where: { topic: { slug: topicSlug }, publishedAt: { not: null } },
            orderBy: { publishedAt: 'desc' },
            select: { id: true, title: true, slug: true, excerpt: true, publishedAt: true },
            skip,
            take: limit,
        }),
    ]);
    res.json({ total, page, limit, data: posts });
}
