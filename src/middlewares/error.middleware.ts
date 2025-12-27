import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import logger from '../config/logger'
import { AppError } from '../utils/AppError'

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    let error = err;

    // Convert known errors to AppError
    if (err instanceof ZodError) {
        return res.status(400).json({ status: 'fail', message: 'Validation failed', errors: err.flatten() })
    }

    if (err && err.code === 'P2002') {
        return res.status(409).json({ status: 'fail', message: 'Resource already exists', meta: err.meta })
    }

    // Explicit AppError
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            status: error.status,
            message: error.message
        })
    }

    // Default error
    logger.error(err)

    if (process.env.NODE_ENV === 'development') {
        return res.status(500).json({
            status: 'error',
            message: err.message,
            stack: err.stack,
            error: err
        })
    }

    return res.status(500).json({
        status: 'error',
        message: 'Internal server error'
    })
}
