import { Router } from 'express';
import { getTopics } from '../controllers/public.controller';
const router = Router();
router.get('/topics', getTopics);
export default router;
