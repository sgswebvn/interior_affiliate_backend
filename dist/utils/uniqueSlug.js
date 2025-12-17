"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureUniqueSlug = ensureUniqueSlug;
// Ensure a slug is unique for a given model (post | topic | tag)
async function ensureUniqueSlug(prisma, model, base, excludeId) {
    // Build where clause
    const where = { slug: { startsWith: base } };
    if (excludeId) {
        where.id = { not: excludeId };
    }
    // Query existing slugs that start with base
    const rows = await prisma[model].findMany({ where, select: { slug: true } });
    const slugs = rows.map((r) => r.slug);
    if (!slugs.includes(base))
        return base;
    // Find highest numeric suffix
    let max = 0;
    const re = new RegExp(`^${base}-(\\d+)$`);
    slugs.forEach((s) => {
        const m = s.match(re);
        if (m) {
            const n = Number(m[1]);
            if (!isNaN(n) && n > max)
                max = n;
        }
    });
    return `${base}-${max + 1}`;
}
exports.default = ensureUniqueSlug;
