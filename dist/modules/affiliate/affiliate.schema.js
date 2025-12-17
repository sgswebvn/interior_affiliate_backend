"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAffiliateSchema = void 0;
const zod_1 = require("zod");
exports.createAffiliateSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2),
        url: zod_1.z.string().url(),
        brand: zod_1.z.string().optional(),
        price: zod_1.z.string().optional(),
        image: zod_1.z.string().optional(),
    }),
});
