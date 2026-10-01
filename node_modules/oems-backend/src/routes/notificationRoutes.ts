import { Router } from 'express';
import {
  getNotifications,
  markNotificationRead,
  toggleNotificationRead,
  markAllNotificationsRead
} from '../controllers/notificationController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', requireAuth, getNotifications);
router.patch('/:id/read', requireAuth, markNotificationRead);
router.patch('/:id/toggle', requireAuth, toggleNotificationRead);
router.patch('/read-all', requireAuth, markAllNotificationsRead);

export default router;
