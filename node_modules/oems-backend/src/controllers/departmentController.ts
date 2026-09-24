import { Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { mockDb, Department } from '../services/mockDb.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export async function getDepartments(req: AuthRequest, res: Response) {
  return res.json(mockDb.departments);
}

export async function createDepartment(req: AuthRequest, res: Response) {
  const { name, code } = z
    .object({
      name: z.string().min(2),
      code: z.string().min(2)
    })
    .parse(req.body);

  const newDept: Department = {
    id: uuidv4(),
    name,
    code: code.toUpperCase(),
    created_at: new Date().toISOString()
  };

  mockDb.departments.push(newDept);
  mockDb.logAudit('CREATE_DEPARTMENT', 'DEPARTMENT', newDept.id, { name, code }, req.user?.id, req.user?.email);

  return res.status(201).json(newDept);
}

export async function updateDepartment(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { name, code } = z
    .object({
      name: z.string().min(2),
      code: z.string().min(2)
    })
    .parse(req.body);

  const dept = mockDb.departments.find((d) => d.id === id);
  if (!dept) {
    return res.status(404).json({ error: 'Department not found' });
  }

  dept.name = name;
  dept.code = code.toUpperCase();

  mockDb.logAudit('UPDATE_DEPARTMENT', 'DEPARTMENT', dept.id, { name, code }, req.user?.id, req.user?.email);

  return res.json(dept);
}

export async function deleteDepartment(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const index = mockDb.departments.findIndex((d) => d.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Department not found' });
  }

  const deleted = mockDb.departments.splice(index, 1)[0];
  mockDb.logAudit('DELETE_DEPARTMENT', 'DEPARTMENT', id, { name: deleted.name }, req.user?.id, req.user?.email);

  return res.json({ message: 'Department deleted successfully' });
}
