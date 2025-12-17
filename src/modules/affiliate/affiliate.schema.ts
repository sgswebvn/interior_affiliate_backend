import { z } from 'zod'

export const createAffiliateSchema = z.object({
    body: z.object({
        name: z.string().min(2),
        url: z.string().url(),
        brand: z.string().optional(),
        price: z.string().optional(),
        image: z.string().optional(),
    }),
})
