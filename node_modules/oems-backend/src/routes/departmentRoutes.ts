import { Router } from 'express';
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment
} from '../controllers/departmentController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', requireAuth, getDepartments);
router.post('/', requireAuth, requireRole('admin'), createDepartment);
router.put('/:id', requireAuth, requireRole('admin'), updateDepartment);
router.delete('/:id', requireAuth, requireRole('admin'), deleteDepartment);

export default router;
