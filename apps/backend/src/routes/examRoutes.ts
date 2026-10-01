import { Router } from 'express';
import {
  getExams,
  getExamById,
  createExam,
  updateExam,
  publishExam,
  startExam
} from '../controllers/examController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', requireAuth, getExams);
router.get('/:id', requireAuth, getExamById);
router.post('/', requireAuth, requireRole('faculty', 'admin'), createExam);
router.put('/:id', requireAuth, requireRole('faculty', 'admin'), updateExam);
router.post('/:id/publish', requireAuth, requireRole('faculty', 'admin'), publishExam);
router.post('/:id/start', requireAuth, requireRole('student'), startExam);

export default router;
