import { Router } from 'express';
import {
  getBatches,
  createBatch,
  updateBatch,
  deleteBatch
} from '../controllers/batchController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', requireAuth, getBatches);
router.post('/', requireAuth, requireRole('admin'), createBatch);
router.put('/:id', requireAuth, requireRole('admin'), updateBatch);
router.delete('/:id', requireAuth, requireRole('admin'), deleteBatch);

export default router;
