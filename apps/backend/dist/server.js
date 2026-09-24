"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const env_js_1 = require("./config/env.js");
const errorHandler_js_1 = require("./middleware/errorHandler.js");
const authRoutes_js_1 = __importDefault(require("./routes/authRoutes.js"));
const departmentRoutes_js_1 = __importDefault(require("./routes/departmentRoutes.js"));
const batchRoutes_js_1 = __importDefault(require("./routes/batchRoutes.js"));
const userRoutes_js_1 = __importDefault(require("./routes/userRoutes.js"));
const questionRoutes_js_1 = __importDefault(require("./routes/questionRoutes.js"));
const examRoutes_js_1 = __importDefault(require("./routes/examRoutes.js"));
const submissionRoutes_js_1 = __importDefault(require("./routes/submissionRoutes.js"));
const resultRoutes_js_1 = __importDefault(require("./routes/resultRoutes.js"));
const notificationRoutes_js_1 = __importDefault(require("./routes/notificationRoutes.js"));
const auditRoutes_js_1 = __importDefault(require("./routes/auditRoutes.js"));
const statsRoutes_js_1 = __importDefault(require("./routes/statsRoutes.js"));
const app = (0, express_1.default)();
// Configure CORS
app.use((0, cors_1.default)({
    origin: [env_js_1.config.frontendUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true
}));
app.use(express_1.default.json({ limit: '10mb' }));
// System Health Endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        system: 'Online Exam Management System (OEMS) API Server',
        timestamp: new Date().toISOString(),
        supabaseConfigured: env_js_1.config.isSupabaseConfigured,
        resendConfigured: Boolean(env_js_1.config.resendApiKey)
    });
});
// Mount Domain Routes
app.use('/api/auth', authRoutes_js_1.default);
app.use('/api/departments', departmentRoutes_js_1.default);
app.use('/api/batches', batchRoutes_js_1.default);
app.use('/api/users', userRoutes_js_1.default);
app.use('/api/questions', questionRoutes_js_1.default);
app.use('/api/exams', examRoutes_js_1.default);
app.use('/api/submissions', submissionRoutes_js_1.default);
app.use('/api/results', resultRoutes_js_1.default);
app.use('/api/notifications', notificationRoutes_js_1.default);
app.use('/api/audit-logs', auditRoutes_js_1.default);
app.use('/api/stats', statsRoutes_js_1.default);
// Global Error Handler
app.use(errorHandler_js_1.errorHandler);
const PORT = env_js_1.config.port;
app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 OEMS Backend Server running on http://localhost:${PORT}`);
    console.log(`Supabase Integration: ${env_js_1.config.isSupabaseConfigured ? 'CONNECTED' : 'MOCK DEMO ENGINE ACTIVE'}`);
    console.log(`Resend Mailer API: ${env_js_1.config.resendApiKey ? 'CONNECTED' : 'MOCK LOGGER ACTIVE'}`);
    console.log(`=======================================================`);
});
exports.default = app;
