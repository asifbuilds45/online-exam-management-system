import { Router } from 'express';
import { getAdminStats, getFacultyStats, getStudentStats } from '../controllers/statsController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/admin', requireAuth, requireRole('admin'), getAdminStats);
router.get('/faculty', requireAuth, requireRole('faculty'), getFacultyStats);
router.get('/student', requireAuth, requireRole('student'), getStudentStats);

export default router;
