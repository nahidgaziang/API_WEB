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

router.use(authenticateToken);

router.get('/courses', getAllCourses);
router.get('/courses/:courseId/materials', getCourseMaterials);

router.post('/enroll', requireRole('learner'), enrollInCourse);
router.get('/my-courses', requireRole('learner'), getMyEnrollments);
router.post('/complete-course', requireRole('learner'), completeCourse);
router.get('/certificates', requireRole('learner'), getMyCertificates);

export default router;
