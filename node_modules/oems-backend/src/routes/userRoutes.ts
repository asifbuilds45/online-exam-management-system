import { Router } from 'express';
import {
  getUsers,
  createUser,
  updateUser,
  deactivateUser
} from '../controllers/userController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', requireAuth, requireRole('admin', 'faculty'), getUsers);
router.post('/', requireAuth, requireRole('admin'), createUser);
router.put('/:id', requireAuth, requireRole('admin'), updateUser);
router.patch('/:id/toggle-status', requireAuth, requireRole('admin'), deactivateUser);

export default router;
