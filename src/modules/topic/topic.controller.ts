import { Request, Response } from 'express'
import { catchAsync } from '../../utils/catchAsync'
import { TopicService } from './topic.service'

export const listTopics = catchAsync(async (req: Request, res: Response) => {
    // Admin list: access all
    const result = await TopicService.findAll({ ...req.query, isPublic: false })
    res.json(result)
})

export const listPublicTopics = catchAsync(async (req: Request, res: Response) => {
    const result = await TopicService.findAll({ ...req.query, isPublic: true })
    res.json(result)
})

export const getTopicById = catchAsync(async (req: Request, res: Response) => {
    const topic = await TopicService.findById(Number(req.params.id))
    res.json(topic)
})

export const getTopicBySlug = catchAsync(async (req: Request, res: Response) => {
    const topic = await TopicService.findBySlug(req.params.slug)
    res.json(topic)
})

export const createTopic = catchAsync(async (req: Request, res: Response) => {
    const topic = await TopicService.create(req.body)
    res.status(201).json(topic)
})

export const updateTopic = catchAsync(async (req: Request, res: Response) => {
    const topic = await TopicService.update(Number(req.params.id), req.body)
    res.json(topic)
})

export const deleteTopic = catchAsync(async (req: Request, res: Response) => {
    await TopicService.delete(Number(req.params.id))
    res.json({ message: 'Topic deleted successfully' })
})
