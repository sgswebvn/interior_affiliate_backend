"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTopicSchema = void 0;
const zod_1 = require("zod");
exports.createTopicSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(3),
        seoTitle: zod_1.z.string().optional(),
        seoDesc: zod_1.z.string().optional(),
    }),
});
