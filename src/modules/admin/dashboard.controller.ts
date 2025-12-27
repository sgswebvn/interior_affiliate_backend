import { Request, Response } from 'express'
import { catchAsync } from '../../utils/catchAsync'
import { DashboardService } from './dashboard.service'

export const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
    const stats = await DashboardService.getStats()
    res.json(stats)
})

