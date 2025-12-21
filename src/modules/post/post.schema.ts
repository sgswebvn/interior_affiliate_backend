import { z } from 'zod'

export const createPostSchema = z.object({
    body: z.object({
        title: z.string().min(5),
        excerpt: z.string().optional(),
        content: z.string().min(20),
        intent: z.enum(['INFORMATIONAL', 'COMMERCIAL']),
        topicId: z.number(),
        tagIds: z.array(z.number()).optional(),
        affiliateIds: z.array(z.number()).optional(),
        thumbnail: z.string().optional(),
        published: z.boolean().optional(),
    }),
})

export const updatePostSchema = z.object({
    params: z.object({
        id: z.string(),
    }),
    body: createPostSchema.shape.body,
})
