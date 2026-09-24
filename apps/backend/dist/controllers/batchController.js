"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBatches = getBatches;
exports.createBatch = createBatch;
exports.updateBatch = updateBatch;
exports.deleteBatch = deleteBatch;
const zod_1 = require("zod");
const uuid_1 = require("uuid");
const mockDb_js_1 = require("../services/mockDb.js");
async function getBatches(req, res) {
    const result = mockDb_js_1.mockDb.batches.map((b) => {
        const dept = mockDb_js_1.mockDb.departments.find((d) => d.id === b.department_id);
        return {
            ...b,
            department_name: dept ? dept.name : 'Unassigned'
        };
    });
    return res.json(result);
}
async function createBatch(req, res) {
    const { department_id, name, start_year, end_year } = zod_1.z
        .object({
        department_id: zod_1.z.string().uuid(),
        name: zod_1.z.string().min(2),
        start_year: zod_1.z.number().int(),
        end_year: zod_1.z.number().int()
    })
        .parse(req.body);
    const newBatch = {
        id: (0, uuid_1.v4)(),
        department_id,
        name,
        start_year,
        end_year,
        created_at: new Date().toISOString()
    };
    mockDb_js_1.mockDb.batches.push(newBatch);
    mockDb_js_1.mockDb.logAudit('CREATE_BATCH', 'BATCH', newBatch.id, { name, department_id }, req.user?.id, req.user?.email);
    return res.status(201).json(newBatch);
}
async function updateBatch(req, res) {
    const { id } = req.params;
    const { department_id, name, start_year, end_year } = zod_1.z
        .object({
        department_id: zod_1.z.string().uuid(),
        name: zod_1.z.string().min(2),
        start_year: zod_1.z.number().int(),
        end_year: zod_1.z.number().int()
    })
        .parse(req.body);
    const batch = mockDb_js_1.mockDb.batches.find((b) => b.id === id);
    if (!batch) {
        return res.status(404).json({ error: 'Batch not found' });
    }
    batch.department_id = department_id;
    batch.name = name;
    batch.start_year = start_year;
    batch.end_year = end_year;
    mockDb_js_1.mockDb.logAudit('UPDATE_BATCH', 'BATCH', batch.id, { name }, req.user?.id, req.user?.email);
    return res.json(batch);
}
async function deleteBatch(req, res) {
    const { id } = req.params;
    const index = mockDb_js_1.mockDb.batches.findIndex((b) => b.id === id);
    if (index === -1) {
        return res.status(404).json({ error: 'Batch not found' });
    }
    const deleted = mockDb_js_1.mockDb.batches.splice(index, 1)[0];
    mockDb_js_1.mockDb.logAudit('DELETE_BATCH', 'BATCH', id, { name: deleted.name }, req.user?.id, req.user?.email);
    return res.json({ message: 'Batch deleted successfully' });
}
