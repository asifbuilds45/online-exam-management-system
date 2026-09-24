"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuditLogs = getAuditLogs;
const mockDb_js_1 = require("../services/mockDb.js");
async function getAuditLogs(req, res) {
    const { action, entity_type, search } = req.query;
    let logs = [...mockDb_js_1.mockDb.auditLogs];
    if (action) {
        logs = logs.filter((l) => l.action === action);
    }
    if (entity_type) {
        logs = logs.filter((l) => l.entity_type === entity_type);
    }
    if (search) {
        const qStr = String(search).toLowerCase();
        logs = logs.filter((l) => l.action.toLowerCase().includes(qStr) ||
            l.entity_type.toLowerCase().includes(qStr) ||
            (l.user_email && l.user_email.toLowerCase().includes(qStr)));
    }
    return res.json(logs);
}
