import { Router } from 'express';
import {
    getInstructorStats,
    getLmsBalance,
    getSystemStats,
    getAllTransactions,
    addTopic,
    addInstructor,
    deleteTopic,
    deleteInstructor,
} from '../controllers/admin.controller';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/roleCheck';
const router = Router();
router.use(authenticateToken);
router.use(requireRole('lms_admin'));
router.get('/instructor-stats', getInstructorStats);
router.get('/balance', getLmsBalance);
router.get('/system-stats', getSystemStats);
router.get('/transactions', getAllTransactions);
router.post('/topic', addTopic);
router.delete('/topic/:id', deleteTopic);
router.post('/instructor', addInstructor);
router.delete('/instructor/:id', deleteInstructor);
export default router;
