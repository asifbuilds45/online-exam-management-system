import { Router } from 'express';
import {
  publishResults,
  getResults,
  getResultDetail,
  exportResultsCSV
} from '../controllers/resultController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', requireAuth, getResults);
router.get('/exam/:examId/student/:studentId', requireAuth, getResultDetail);
router.post('/publish/:examId', requireAuth, requireRole('faculty', 'admin'), publishResults);
router.get('/export-csv/:examId', requireAuth, requireRole('faculty', 'admin'), exportResultsCSV);

export default router;
