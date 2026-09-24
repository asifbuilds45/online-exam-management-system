import { Response } from 'express';
import { mockDb } from '../services/mockDb.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export async function getNotifications(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  const notifs = mockDb.notifications.filter((n) => n.user_id === userId);
  return res.json(notifs);
}

export async function markNotificationRead(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const notif = mockDb.notifications.find((n) => n.id === id);
  if (!notif) {
    return res.status(404).json({ error: 'Notification not found' });
  }

  notif.is_read = true;
  notif.read_at = new Date().toISOString();

  return res.json(notif);
}

export async function markAllNotificationsRead(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  mockDb.notifications
    .filter((n) => n.user_id === userId)
    .forEach((n) => {
      n.is_read = true;
      n.read_at = new Date().toISOString();
    });

  return res.json({ message: 'All notifications marked as read' });
}
