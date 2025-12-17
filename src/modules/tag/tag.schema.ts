import { z } from 'zod'

export const createTagSchema = z.object({
    body: z.object({
        name: z.string().min(2),
        type: z.enum(['PRODUCT', 'BRAND', 'STYLE', 'PROBLEM', 'PRICE']),
    }),
})
