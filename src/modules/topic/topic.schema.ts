import { z } from 'zod'

export const createTopicSchema = z.object({
    body: z.object({
        name: z.string().min(3),
        seoTitle: z.string().optional(),
        seoDesc: z.string().optional(),
    }),
})
