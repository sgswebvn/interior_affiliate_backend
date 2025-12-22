import { Router } from 'express';
import { subscribeToNewsletter } from './subscriber.controller';

const router = Router();

router.post('/subscribe', subscribeToNewsletter);

export default router;
