"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = getUsers;
exports.createUser = createUser;
exports.updateUser = updateUser;
exports.deactivateUser = deactivateUser;
const zod_1 = require("zod");
const uuid_1 = require("uuid");
const mockDb_js_1 = require("../services/mockDb.js");
async function getUsers(req, res) {
    const { role, status, search } = req.query;
    let filtered = [...mockDb_js_1.mockDb.profiles];
    if (role) {
        filtered = filtered.filter((u) => u.role === role);
    }
    if (status) {
        filtered = filtered.filter((u) => u.status === status);
    }
    if (search) {
        const query = String(search).toLowerCase();
        filtered = filtered.filter((u) => u.full_name.toLowerCase().includes(query) ||
            u.email.toLowerCase().includes(query) ||
            (u.registration_number && u.registration_number.toLowerCase().includes(query)));
    }
    const enriched = filtered.map((u) => {
        const dept = mockDb_js_1.mockDb.departments.find((d) => d.id === u.department_id);
        const batch = mockDb_js_1.mockDb.batches.find((b) => b.id === u.batch_id);
        return {
            ...u,
            department_name: dept ? dept.name : 'N/A',
            batch_name: batch ? batch.name : 'N/A'
        };
    });
    return res.json(enriched);
}
async function createUser(req, res) {
    const schema = zod_1.z.object({
        full_name: zod_1.z.string().min(2),
        email: zod_1.z.string().email(),
        role: zod_1.z.enum(['student', 'faculty', 'admin']),
        department_id: zod_1.z.string().optional(),
        batch_id: zod_1.z.string().optional(),
        registration_number: zod_1.z.string().optional(),
        phone: zod_1.z.string().optional()
    });
    const body = schema.parse(req.body);
    const existing = mockDb_js_1.mockDb.profiles.find((p) => p.email.toLowerCase() === body.email.toLowerCase());
    if (existing) {
        return res.status(400).json({ error: 'User with this email already exists' });
    }
    const newProfile = {
        id: (0, uuid_1.v4)(),
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
    mockDb_js_1.mockDb.profiles.push(newProfile);
    mockDb_js_1.mockDb.logAudit('CREATE_USER', 'PROFILE', newProfile.id, { email: newProfile.email, role: newProfile.role }, req.user?.id, req.user?.email);
    return res.status(201).json(newProfile);
}
async function updateUser(req, res) {
    const { id } = req.params;
    const schema = zod_1.z.object({
        full_name: zod_1.z.string().min(2).optional(),
        role: zod_1.z.enum(['student', 'faculty', 'admin']).optional(),
        department_id: zod_1.z.string().optional(),
        batch_id: zod_1.z.string().optional(),
        registration_number: zod_1.z.string().optional(),
        phone: zod_1.z.string().optional(),
        status: zod_1.z.enum(['active', 'inactive', 'suspended']).optional()
    });
    const body = schema.parse(req.body);
    const profile = mockDb_js_1.mockDb.profiles.find((p) => p.id === id);
    if (!profile) {
        return res.status(404).json({ error: 'User profile not found' });
    }
    Object.assign(profile, body, { updated_at: new Date().toISOString() });
    mockDb_js_1.mockDb.logAudit('UPDATE_USER', 'PROFILE', profile.id, body, req.user?.id, req.user?.email);
    return res.json(profile);
}
async function deactivateUser(req, res) {
    const { id } = req.params;
    const profile = mockDb_js_1.mockDb.profiles.find((p) => p.id === id);
    if (!profile) {
        return res.status(404).json({ error: 'User profile not found' });
    }
    profile.status = profile.status === 'active' ? 'inactive' : 'active';
    profile.updated_at = new Date().toISOString();
    mockDb_js_1.mockDb.logAudit('TOGGLE_USER_STATUS', 'PROFILE', profile.id, { status: profile.status }, req.user?.id, req.user?.email);
    return res.json({ message: `User status changed to ${profile.status}`, user: profile });
}
