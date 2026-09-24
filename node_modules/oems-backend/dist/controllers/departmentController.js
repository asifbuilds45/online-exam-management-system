"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDepartments = getDepartments;
exports.createDepartment = createDepartment;
exports.updateDepartment = updateDepartment;
exports.deleteDepartment = deleteDepartment;
const zod_1 = require("zod");
const uuid_1 = require("uuid");
const mockDb_js_1 = require("../services/mockDb.js");
async function getDepartments(req, res) {
    return res.json(mockDb_js_1.mockDb.departments);
}
async function createDepartment(req, res) {
    const { name, code } = zod_1.z
        .object({
        name: zod_1.z.string().min(2),
        code: zod_1.z.string().min(2)
    })
        .parse(req.body);
    const newDept = {
        id: (0, uuid_1.v4)(),
        name,
        code: code.toUpperCase(),
        created_at: new Date().toISOString()
    };
    mockDb_js_1.mockDb.departments.push(newDept);
    mockDb_js_1.mockDb.logAudit('CREATE_DEPARTMENT', 'DEPARTMENT', newDept.id, { name, code }, req.user?.id, req.user?.email);
    return res.status(201).json(newDept);
}
async function updateDepartment(req, res) {
    const { id } = req.params;
    const { name, code } = zod_1.z
        .object({
        name: zod_1.z.string().min(2),
        code: zod_1.z.string().min(2)
    })
        .parse(req.body);
    const dept = mockDb_js_1.mockDb.departments.find((d) => d.id === id);
    if (!dept) {
        return res.status(404).json({ error: 'Department not found' });
    }
    dept.name = name;
    dept.code = code.toUpperCase();
    mockDb_js_1.mockDb.logAudit('UPDATE_DEPARTMENT', 'DEPARTMENT', dept.id, { name, code }, req.user?.id, req.user?.email);
    return res.json(dept);
}
async function deleteDepartment(req, res) {
    const { id } = req.params;
    const index = mockDb_js_1.mockDb.departments.findIndex((d) => d.id === id);
    if (index === -1) {
        return res.status(404).json({ error: 'Department not found' });
    }
    const deleted = mockDb_js_1.mockDb.departments.splice(index, 1)[0];
    mockDb_js_1.mockDb.logAudit('DELETE_DEPARTMENT', 'DEPARTMENT', id, { name: deleted.name }, req.user?.id, req.user?.email);
    return res.json({ message: 'Department deleted successfully' });
}
