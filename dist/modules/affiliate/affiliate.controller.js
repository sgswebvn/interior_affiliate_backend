"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAffiliates = listAffiliates;
exports.createAffiliate = createAffiliate;
exports.redirectAffiliate = redirectAffiliate;
const prisma_1 = require("../../config/prisma");
async function listAffiliates(req, res) {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const skip = (page - 1) * limit;
    const [total, affiliates] = await Promise.all([
        prisma_1.prisma.affiliate.count(),
        prisma_1.prisma.affiliate.findMany({ skip, take: limit, orderBy: { id: 'desc' } }),
    ]);
    res.json({ total, page, limit, data: affiliates });
}
async function createAffiliate(req, res) {
    const affiliate = await prisma_1.prisma.affiliate.create({
        data: req.body,
    });
    res.status(201).json(affiliate);
}
async function redirectAffiliate(req, res) {
    const id = Number(req.params.affiliateId);
    const affiliate = await prisma_1.prisma.affiliate.findUnique({
        where: { id },
    });
    if (!affiliate)
        return res.status(404).end();
    // future: log click here
    res.redirect(affiliate.url);
}
