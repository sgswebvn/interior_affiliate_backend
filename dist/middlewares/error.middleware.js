"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
function errorHandler(err, req, res, next) {
    // Zod validation errors -> 400
    if (err instanceof zod_1.ZodError) {
        return res.status(400).json({ message: 'Validation failed', errors: err.flatten() });
    }
    // Prisma unique constraint (P2002) -> 409
    if (err && err.code === 'P2002') {
        return res.status(409).json({ message: 'Resource already exists', meta: err.meta });
    }
    // Other Prisma errors -> 400 with some detail
    if (err && typeof err.code === 'string' && err.code.startsWith('P')) {
        return res.status(400).json({ message: 'Database error', detail: err.meta || err.message });
    }
    // JWT errors
    if (err && err.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
    }
    console.error(err);
    const status = err?.status || 500;
    const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : err?.message || 'Internal server error';
    res.status(status).json({ message });
}
