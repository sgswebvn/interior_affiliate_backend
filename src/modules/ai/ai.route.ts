
import { Router } from 'express';
import { generateSeoContent, chatWithSite } from './ai.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

// Admin only
router.post('/generate-seo', authenticate, generateSeoContent);

// Public
router.post('/chat', chatWithSite);

export default router;
