import { ZodSchema } from 'zod'
import { Request, Response, NextFunction } from 'express'

export const validate = (schema: ZodSchema<any>) => (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse({ body: req.body, params: req.params, query: req.query })

    if (!parsed.success) {
        // Return structured validation errors (400)
        const flattened = parsed.error.flatten()
        return res.status(400).json({ message: 'Validation failed', errors: flattened })
    }

    // Replace req values with the validated/coerced values so controllers work with typed data
    req.body = parsed.data.body ?? {}
    req.params = parsed.data.params ?? {}
    req.query = parsed.data.query ?? {}

    next()
}
