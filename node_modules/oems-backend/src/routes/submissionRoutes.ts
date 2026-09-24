import { Router } from 'express';
import {
  autosaveAnswer,
  submitExam,
  getSubmissionsForExam,
  gradeDescriptiveSubmission
} from '../controllers/submissionController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/autosave', requireAuth, requireRole('student'), autosaveAnswer);
router.post('/submit', requireAuth, requireRole('student'), submitExam);
router.get('/exam/:examId', requireAuth, requireRole('faculty', 'admin'), getSubmissionsForExam);
router.post('/grade/:submissionId', requireAuth, requireRole('faculty', 'admin'), gradeDescriptiveSubmission);

export default router;
