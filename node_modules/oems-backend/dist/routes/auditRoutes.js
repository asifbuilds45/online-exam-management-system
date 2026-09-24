"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auditController_js_1 = require("../controllers/auditController.js");
const authMiddleware_js_1 = require("../middleware/authMiddleware.js");
const router = (0, express_1.Router)();
router.get('/', authMiddleware_js_1.requireAuth, (0, authMiddleware_js_1.requireRole)('admin'), auditController_js_1.getAuditLogs);
exports.default = router;
