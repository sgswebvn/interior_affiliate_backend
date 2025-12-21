import rateLimit from 'express-rate-limit'

export const apiLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 300, // Allow 300 requests per 10 mins (approx 30 req/min) - better for SEO crawlers
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests, please try again later.',
})
