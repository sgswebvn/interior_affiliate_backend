"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePostSchema = exports.createPostSchema = void 0;
const zod_1 = require("zod");
exports.createPostSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(5),
        excerpt: zod_1.z.string().optional(),
        content: zod_1.z.string().min(20),
        intent: zod_1.z.enum(['INFORMATIONAL', 'COMMERCIAL']),
        topicId: zod_1.z.number(),
        tagIds: zod_1.z.array(zod_1.z.number()).optional(),
        affiliateIds: zod_1.z.array(zod_1.z.number()).optional(),
        published: zod_1.z.boolean().optional(),
    }),
});
exports.updatePostSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string(),
    }),
    body: exports.createPostSchema.shape.body,
});
