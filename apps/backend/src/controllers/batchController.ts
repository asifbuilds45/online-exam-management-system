import { Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { mockDb, Batch } from '../services/mockDb.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export async function getBatches(req: AuthRequest, res: Response) {
  const result = mockDb.batches.map((b) => {
    const dept = mockDb.departments.find((d) => d.id === b.department_id);
    return {
      ...b,
      department_name: dept ? dept.name : 'Unassigned'
    };
  });
  return res.json(result);
}

export async function createBatch(req: AuthRequest, res: Response) {
  const { department_id, name, start_year, end_year } = z
    .object({
      department_id: z.string().uuid(),
      name: z.string().min(2),
      start_year: z.number().int(),
      end_year: z.number().int()
    })
    .parse(req.body);

  const newBatch: Batch = {
    id: uuidv4(),
    department_id,
    name,
    start_year,
    end_year,
    created_at: new Date().toISOString()
  };

  mockDb.batches.push(newBatch);
  mockDb.logAudit('CREATE_BATCH', 'BATCH', newBatch.id, { name, department_id }, req.user?.id, req.user?.email);

  return res.status(201).json(newBatch);
}

export async function updateBatch(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { department_id, name, start_year, end_year } = z
    .object({
      department_id: z.string().uuid(),
      name: z.string().min(2),
      start_year: z.number().int(),
      end_year: z.number().int()
    })
    .parse(req.body);

  const batch = mockDb.batches.find((b) => b.id === id);
  if (!batch) {
    return res.status(404).json({ error: 'Batch not found' });
  }

  batch.department_id = department_id;
  batch.name = name;
  batch.start_year = start_year;
  batch.end_year = end_year;

  mockDb.logAudit('UPDATE_BATCH', 'BATCH', batch.id, { name }, req.user?.id, req.user?.email);

  return res.json(batch);
}

export async function deleteBatch(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const index = mockDb.batches.findIndex((b) => b.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Batch not found' });
  }

  const deleted = mockDb.batches.splice(index, 1)[0];
  mockDb.logAudit('DELETE_BATCH', 'BATCH', id, { name: deleted.name }, req.user?.id, req.user?.email);

  return res.json({ message: 'Batch deleted successfully' });
}
