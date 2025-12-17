"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTags = listTags;
exports.createTag = createTag;
const prisma_1 = require("../../config/prisma");
const slugify_1 = require("../../utils/slugify");
const uniqueSlug_1 = require("../../utils/uniqueSlug");
async function listTags(req, res) {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const skip = (page - 1) * limit;
    const [total, tags] = await Promise.all([
        prisma_1.prisma.tag.count(),
        prisma_1.prisma.tag.findMany({ skip, take: limit, orderBy: { name: 'asc' } }),
    ]);
    res.json({ total, page, limit, data: tags });
}
async function createTag(req, res) {
    const { name, type } = req.body;
    const slugBase = (0, slugify_1.slugify)(name);
    const slug = await (0, uniqueSlug_1.ensureUniqueSlug)(prisma_1.prisma, 'tag', slugBase);
    const tag = await prisma_1.prisma.tag.create({ data: { name, slug, type } });
    res.status(201).json(tag);
}
