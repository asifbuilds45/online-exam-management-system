import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import batchRoutes from './routes/batchRoutes.js';
import userRoutes from './routes/userRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import examRoutes from './routes/examRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';
import resultRoutes from './routes/resultRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import statsRoutes from './routes/statsRoutes.js';

const app = express();

// Configure CORS
app.use(
  cors({
    origin: [config.frontendUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true
  })
);

app.use(express.json({ limit: '10mb' }));

// System Health Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'Online Exam Management System (OEMS) API Server',
    timestamp: new Date().toISOString(),
    supabaseConfigured: config.isSupabaseConfigured,
    resendConfigured: Boolean(config.resendApiKey)
  });
});

// Mount Domain Routes
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/users', userRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/stats', statsRoutes);

// Global Error Handler
app.use(errorHandler);

const PORT = config.port;
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 OEMS Backend Server running on http://localhost:${PORT}`);
  console.log(`Supabase Integration: ${config.isSupabaseConfigured ? 'CONNECTED' : 'MOCK DEMO ENGINE ACTIVE'}`);
  console.log(`Resend Mailer API: ${config.resendApiKey ? 'CONNECTED' : 'MOCK LOGGER ACTIVE'}`);
  console.log(`=======================================================`);
});

export default app;
