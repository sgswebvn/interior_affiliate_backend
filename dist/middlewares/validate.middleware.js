"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const validate = (schema) => (req, res, next) => {
    const parsed = schema.safeParse({ body: req.body, params: req.params, query: req.query });
    if (!parsed.success) {
        // Return structured validation errors (400)
        const flattened = parsed.error.flatten();
        return res.status(400).json({ message: 'Validation failed', errors: flattened });
    }
    // Replace req values with the validated/coerced values so controllers work with typed data
    req.body = parsed.data.body ?? {};
    req.params = parsed.data.params ?? {};
    req.query = parsed.data.query ?? {};
    next();
};
exports.validate = validate;
