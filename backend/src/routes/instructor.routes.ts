import { Router } from 'express';
import {
    uploadCourse,
    uploadMaterial,
    getMyCourses,
    getPendingTransactions,
    claimPayment,
} from '../controllers/instructor.controller';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/roleCheck';

const router = Router();

// All routes require authentication and instructor role
router.use(authenticateToken);
router.use(requireRole('instructor'));

router.post('/courses', uploadCourse);
router.post('/materials', uploadMaterial);
router.get('/my-courses', getMyCourses);
router.get('/pending-transactions', getPendingTransactions);
router.post('/claim-payment', claimPayment);

export default router;
