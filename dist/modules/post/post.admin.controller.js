"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminListPosts = adminListPosts;
exports.createPost = createPost;
exports.updatePost = updatePost;
exports.deletePost = deletePost;
const prisma_1 = require("../../config/prisma");
const slugify_1 = require("../../utils/slugify");
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const uniqueSlug_1 = require("../../utils/uniqueSlug");
async function adminListPosts(req, res) {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;
    const [total, posts] = await Promise.all([
        prisma_1.prisma.post.count(),
        prisma_1.prisma.post.findMany({
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                topic: true,
                tags: { include: { tag: true } },
            },
        }),
    ]);
    res.json({ total, page, limit, data: posts });
}
async function createPost(req, res) {
    const data = req.body;
    const slugBase = (0, slugify_1.slugify)(data.title);
    const post = await prisma_1.prisma.$transaction(async (tx) => {
        const slug = await (0, uniqueSlug_1.ensureUniqueSlug)(tx, 'post', slugBase);
        const content = data.content ? (0, sanitize_html_1.default)(data.content, {
            allowedTags: ['p', 'a', 'ul', 'ol', 'li', 'strong', 'em', 'img', 'h1', 'h2', 'h3', 'blockquote'],
            allowedAttributes: {
                a: ['href', 'rel', 'target'],
                img: ['src', 'alt'],
            },
        }) : null;
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
    res.status(201).json(post);
}
async function updatePost(req, res) {
    const id = Number(req.params.id);
    const data = req.body;
    await prisma_1.prisma.$transaction(async (tx) => {
        let slug = undefined;
        if (data.title) {
            const slugBase = (0, slugify_1.slugify)(data.title);
            slug = await (0, uniqueSlug_1.ensureUniqueSlug)(tx, 'post', slugBase, id);
        }
        const content = data.content ? (0, sanitize_html_1.default)(data.content, {
            allowedTags: ['p', 'a', 'ul', 'ol', 'li', 'strong', 'em', 'img', 'h1', 'h2', 'h3', 'blockquote'],
            allowedAttributes: { a: ['href', 'rel', 'target'], img: ['src', 'alt'] },
        }) : null;
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
    });
    res.json({ success: true });
}
async function deletePost(req, res) {
    const id = Number(req.params.id);
    await prisma_1.prisma.$transaction([
        prisma_1.prisma.postTag.deleteMany({ where: { postId: id } }),
        prisma_1.prisma.postAffiliate.deleteMany({ where: { postId: id } }),
        prisma_1.prisma.post.delete({ where: { id } }),
    ]);
    res.json({ success: true });
}
