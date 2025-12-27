import { Request, Response } from 'express'
import { catchAsync } from '../../utils/catchAsync'
import { PostService } from './post.service'

export const listPosts = catchAsync(async (req: Request, res: Response) => {
    const result = await PostService.findAll({ ...req.query, isPublic: false })
    res.json(result)
})

export const listPublicPosts = catchAsync(async (req: Request, res: Response) => {
    const result = await PostService.findAll({ ...req.query, isPublic: true })
    res.json(result)
})

export const getPostById = catchAsync(async (req: Request, res: Response) => {
    const post = await PostService.findById(Number(req.params.id))
    res.json(post)
})

export const getPostBySlug = catchAsync(async (req: Request, res: Response) => {
    const post = await PostService.findBySlug(req.params.slug)
    res.json(post)
})

export const createPost = catchAsync(async (req: Request, res: Response) => {
    const post = await PostService.create(req.body)
    res.status(201).json(post)
})

export const updatePost = catchAsync(async (req: Request, res: Response) => {
    const post = await PostService.update(Number(req.params.id), req.body)
    res.json(post)
})

export const deletePost = catchAsync(async (req: Request, res: Response) => {
    await PostService.delete(Number(req.params.id))
    res.json({ message: 'Post deleted successfully' })
})
