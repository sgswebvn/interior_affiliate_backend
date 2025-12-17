"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTagSchema = void 0;
const zod_1 = require("zod");
exports.createTagSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2),
        type: zod_1.z.enum(['PRODUCT', 'BRAND', 'STYLE', 'PROBLEM', 'PRICE']),
    }),
});
