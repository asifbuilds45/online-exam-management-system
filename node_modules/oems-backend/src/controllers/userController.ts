import { Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { mockDb, Profile } from '../services/mockDb.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export async function getUsers(req: AuthRequest, res: Response) {
  const { role, status, search } = req.query;

  let filtered = [...mockDb.profiles];

  if (role) {
    filtered = filtered.filter((u) => u.role === role);
  }
  if (status) {
    filtered = filtered.filter((u) => u.status === status);
  }
  if (search) {
    const query = String(search).toLowerCase();
    filtered = filtered.filter(
      (u) =>
        u.full_name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        (u.registration_number && u.registration_number.toLowerCase().includes(query))
    );
  }

  const enriched = filtered.map((u) => {
    const dept = mockDb.departments.find((d) => d.id === u.department_id);
    const batch = mockDb.batches.find((b) => b.id === u.batch_id);
    return {
      ...u,
      department_name: dept ? dept.name : 'N/A',
      batch_name: batch ? batch.name : 'N/A'
    };
  });

  return res.json(enriched);
}

export async function createUser(req: AuthRequest, res: Response) {
  const schema = z.object({
    full_name: z.string().min(2),
    email: z.string().email(),
    role: z.enum(['student', 'faculty', 'admin']),
    department_id: z.string().optional(),
    batch_id: z.string().optional(),
    registration_number: z.string().optional(),
    phone: z.string().optional()
  });

  const body = schema.parse(req.body);

  const existing = mockDb.profiles.find((p) => p.email.toLowerCase() === body.email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'User with this email already exists' });
  }

  const newProfile: Profile = {
    id: uuidv4(),
    full_name: body.full_name,
    email: body.email,
    role: body.role,
    department_id: body.department_id,
    batch_id: body.batch_id,
    registration_number: body.registration_number || `REG-${Math.floor(1000 + Math.random() * 9000)}`,
    phone: body.phone,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  mockDb.profiles.push(newProfile);
  mockDb.logAudit('CREATE_USER', 'PROFILE', newProfile.id, { email: newProfile.email, role: newProfile.role }, req.user?.id, req.user?.email);

  return res.status(201).json(newProfile);
}

export async function updateUser(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const schema = z.object({
    full_name: z.string().min(2).optional(),
    role: z.enum(['student', 'faculty', 'admin']).optional(),
    department_id: z.string().optional(),
    batch_id: z.string().optional(),
    registration_number: z.string().optional(),
    phone: z.string().optional(),
    status: z.enum(['active', 'inactive', 'suspended']).optional()
  });

  const body = schema.parse(req.body);

  const profile = mockDb.profiles.find((p) => p.id === id);
  if (!profile) {
    return res.status(404).json({ error: 'User profile not found' });
  }

  Object.assign(profile, body, { updated_at: new Date().toISOString() });
  mockDb.logAudit('UPDATE_USER', 'PROFILE', profile.id, body, req.user?.id, req.user?.email);

  return res.json(profile);
}

export async function deactivateUser(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const profile = mockDb.profiles.find((p) => p.id === id);
  if (!profile) {
    return res.status(404).json({ error: 'User profile not found' });
  }

  profile.status = profile.status === 'active' ? 'inactive' : 'active';
  profile.updated_at = new Date().toISOString();

  mockDb.logAudit('TOGGLE_USER_STATUS', 'PROFILE', profile.id, { status: profile.status }, req.user?.id, req.user?.email);

  return res.json({ message: `User status changed to ${profile.status}`, user: profile });
}
