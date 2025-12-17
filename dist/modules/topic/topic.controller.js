"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTopics = listTopics;
exports.createTopic = createTopic;
const prisma_1 = require("../../config/prisma");
const slugify_1 = require("../../utils/slugify");
const uniqueSlug_1 = require("../../utils/uniqueSlug");
async function listTopics(req, res) {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const skip = (page - 1) * limit;
    const [total, topics] = await Promise.all([
        prisma_1.prisma.topic.count(),
        prisma_1.prisma.topic.findMany({ skip, take: limit, orderBy: { id: 'asc' } }),
    ]);
    res.json({ total, page, limit, data: topics });
}
async function createTopic(req, res) {
    const { name, seoTitle, seoDesc } = req.body;
    const slugBase = (0, slugify_1.slugify)(name);
    const slug = await (0, uniqueSlug_1.ensureUniqueSlug)(prisma_1.prisma, 'topic', slugBase);
    const topic = await prisma_1.prisma.topic.create({
        data: { name, slug, seoTitle, seoDesc },
    });
    res.status(201).json(topic);
}
