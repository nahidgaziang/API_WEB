import { Router } from 'express';
import {
    getAllCourses,
    enrollInCourse,
    getMyEnrollments,
    getCourseMaterials,
    completeCourse,
    getMyCertificates,
} from '../controllers/learner.controller';
import { authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/roleCheck';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Course browsing (available to all authenticated users)
router.get('/courses', getAllCourses);
router.get('/courses/:courseId/materials', getCourseMaterials);

// Learner-specific routes
router.post('/enroll', requireRole('learner'), enrollInCourse);
router.get('/my-courses', requireRole('learner'), getMyEnrollments);
router.post('/complete-course', requireRole('learner'), completeCourse);
router.get('/certificates', requireRole('learner'), getMyCertificates);

export default router;
