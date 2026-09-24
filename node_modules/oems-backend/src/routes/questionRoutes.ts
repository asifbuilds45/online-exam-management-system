import { Router } from 'express';
import {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  importCSV
} from '../controllers/questionController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', requireAuth, getQuestions);
router.get('/:id', requireAuth, getQuestionById);
router.post('/', requireAuth, requireRole('faculty', 'admin'), createQuestion);
router.post('/import-csv', requireAuth, requireRole('faculty', 'admin'), importCSV);
router.put('/:id', requireAuth, requireRole('faculty', 'admin'), updateQuestion);
router.delete('/:id', requireAuth, requireRole('faculty', 'admin'), deleteQuestion);

export default router;
