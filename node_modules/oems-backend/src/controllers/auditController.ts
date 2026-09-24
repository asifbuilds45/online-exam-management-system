import { Response } from 'express';
import { mockDb } from '../services/mockDb.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export async function getAuditLogs(req: AuthRequest, res: Response) {
  const { action, entity_type, search } = req.query;

  let logs = [...mockDb.auditLogs];

  if (action) {
    logs = logs.filter((l) => l.action === action);
  }
  if (entity_type) {
    logs = logs.filter((l) => l.entity_type === entity_type);
  }
  if (search) {
    const qStr = String(search).toLowerCase();
    logs = logs.filter(
      (l) =>
        l.action.toLowerCase().includes(qStr) ||
        l.entity_type.toLowerCase().includes(qStr) ||
        (l.user_email && l.user_email.toLowerCase().includes(qStr))
    );
  }

  return res.json(logs);
}
