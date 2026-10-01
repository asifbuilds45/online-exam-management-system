# Online Exam Management System (OEMS) — Technical Source Code Documentation

> **Document Type:** Architectural & Source Code Specification  
> **Repository:** `online-exam-management-system`  
> **Stack:** React 18, TypeScript, Express.js, Supabase PostgreSQL, Resend Mailer, Vite, TailwindCSS  
> **Architecture Pattern:** Monorepo (`apps/frontend`, `apps/backend`)  

---

## 1. System Overview & Monorepo Architecture

The **Online Exam Management System (OEMS)** is a production-grade full-stack platform supporting multi-tenant access control for three distinct roles:
1. **Students**: Live exam taking, automated answer autosaving, countdown timers, performance analytics, and result card viewing.
2. **Faculty**: Question bank management (MCQ & Descriptive), dynamic/manual exam creation, automated & manual descriptive grading, student performance export.
3. **Administrators**: System-wide departmental & batch management, user account provisioning, security audit trail monitoring, and system metrics dashboard.

### Monorepo Structure

```
online-exam-management-system/
├── apps/
│   ├── backend/               # Express.js REST API Server
│   │   ├── src/
│   │   │   ├── config/        # Environment, Supabase & Resend Mailer integration
│   │   │   ├── controllers/   # Domain business logic (Exams, Submissions, Questions, Auth)
│   │   │   ├── middleware/    # Auth verification & RBAC authorization
│   │   │   ├── routes/        # Express REST endpoints definition
│   │   │   ├── services/      # Database abstraction layer (Mock DB + Supabase Client)
│   │   │   └── server.ts      # Server bootstrap & CORS setup
│   └── frontend/              # Vite React 18 Single Page Application (SPA)
│       ├── src/
│       │   ├── components/    # Reusable UI components & layouts
│       │   ├── context/       # React Context (AuthContext, NotificationContext)
│       │   ├── pages/         # Role-based page views (Admin, Faculty, Student)
│       │   ├── services/      # Axios API Client
│       │   ├── types/         # Core TypeScript domain models
│       │   ├── App.tsx        # React Router routes & RBAC tree
│       │   └── main.tsx       # SPA Entrypoint
└── supabase/
    └── migrations/            # PostgreSQL Schema & RLS Policies
```

---

## 2. Database Schema (PostgreSQL DDL Migration)

**Source File:** `supabase/migrations/20260923000000_init_schema.sql`

```sql
-- Online Exam Management System (OEMS) - Complete PostgreSQL Schema & RLS Policies
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. DEPARTMENTS
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(20) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BATCHES
CREATE TABLE IF NOT EXISTS batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  start_year INT NOT NULL,
  end_year INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PROFILES (Integrates with Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'faculty', 'admin')),
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  batch_id UUID REFERENCES batches(id) ON DELETE SET NULL,
  registration_number VARCHAR(50) UNIQUE,
  avatar_url TEXT,
  phone VARCHAR(20),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. QUESTIONS
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subject VARCHAR(100) NOT NULL,
  topic VARCHAR(100),
  question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('mcq', 'descriptive')),
  question_text TEXT NOT NULL,
  explanation TEXT,
  difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  default_marks NUMERIC(5,2) DEFAULT 1.00,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. QUESTION OPTIONS
CREATE TABLE IF NOT EXISTS question_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  option_order INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. EXAMS
CREATE TABLE IF NOT EXISTS exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  batch_id UUID REFERENCES batches(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  description TEXT,
  duration_minutes INT NOT NULL,
  total_marks NUMERIC(6,2) DEFAULT 0.00,
  passing_marks NUMERIC(6,2) DEFAULT 0.00,
  negative_marking_rate NUMERIC(4,2) DEFAULT 0.00,
  question_selection_type VARCHAR(20) DEFAULT 'manual' CHECK (question_selection_type IN ('manual', 'random')),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'ongoing', 'completed', 'archived')),
  shuffle_questions BOOLEAN DEFAULT FALSE,
  shuffle_options BOOLEAN DEFAULT FALSE,
  results_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. EXAM SUBMISSIONS
CREATE TABLE IF NOT EXISTS exam_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  time_spent_seconds INT DEFAULT 0,
  auto_submitted BOOLEAN DEFAULT FALSE,
  total_score NUMERIC(6,2) DEFAULT 0.00,
  is_evaluated BOOLEAN DEFAULT FALSE,
  grade VARCHAR(10),
  feedback TEXT,
  UNIQUE(exam_id, student_id)
);
```

---

## 3. Core Backend Infrastructure Code

### 3.1 Express API Server Initialization
**Source File:** `apps/backend/src/server.ts`

```typescript
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

app.use(
  cors({
    origin: [config.frontendUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true
  })
);

app.use(express.json({ limit: '10mb' }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'Online Exam Management System (OEMS) API Server',
    timestamp: new Date().toISOString(),
    supabaseConfigured: config.isSupabaseConfigured,
    resendConfigured: Boolean(config.resendApiKey)
  });
});

// Domain Routes
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

app.use(errorHandler);

const PORT = config.port;
app.listen(PORT, () => {
  console.log(`🚀 OEMS Backend Server running on http://localhost:${PORT}`);
});

export default app;
```

---

### 3.2 Authentication & Role-Based Access Control (RBAC) Middleware
**Source File:** `apps/backend/src/middleware/authMiddleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { mockDb, Profile } from '../services/mockDb.js';
import { supabaseAdmin } from '../config/supabase.js';

export interface AuthRequest extends Request {
  user?: Profile;
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication token missing' });
    }

    const token = authHeader.split(' ')[1];

    // 1. Mock Token Bypass Strategy for Local Sandbox Testing
    if (token.startsWith('mock-token-')) {
      const email = token.replace('mock-token-', '');
      const profile = mockDb.profiles.find((p) => p.email === email);
      if (!profile) return res.status(401).json({ error: 'User profile not found' });
      req.user = profile;
      return next();
    }

    // 2. JWT Signature Verification Strategy
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as any;
      const profile = mockDb.profiles.find((p) => p.id === decoded.sub || p.email === decoded.email);
      if (profile) {
        req.user = profile;
        return next();
      }
    } catch (e) {
      // Fallthrough to Supabase check
    }

    // 3. Supabase Auth Verification Strategy
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin.auth.getUser(token);
      if (!error && data.user) {
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profile) {
          req.user = profile;
          return next();
        }
      }
    }

    return res.status(401).json({ error: 'Invalid or expired authentication token' });
  } catch (error) {
    return res.status(401).json({ error: 'Authentication failed' });
  }
}

export function requireRole(...roles: Array<'student' | 'faculty' | 'admin'>) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized: User context missing' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: Requires one of [${roles.join(', ')}] roles. Yours is '${req.user.role}'`
      });
    }
    next();
  };
}
```

---

### 3.3 Exam Submission & Automated Scoring Engine
**Source File:** `apps/backend/src/controllers/submissionController.ts`

```typescript
import { Response } from 'express';
import { z } from 'zod';
import { mockDb } from '../services/mockDb.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export async function submitExam(req: AuthRequest, res: Response) {
  const schema = z.object({
    submission_id: z.string().uuid(),
    auto_submitted: z.boolean().optional().default(false),
    time_spent_seconds: z.number().optional().default(0)
  });

  const { submission_id, auto_submitted, time_spent_seconds } = schema.parse(req.body);

  const submission = mockDb.examSubmissions.find((s) => s.id === submission_id);
  if (!submission) return res.status(404).json({ error: 'Exam submission session not found' });
  if (submission.submitted_at) return res.status(400).json({ error: 'Exam has already been submitted.' });

  const exam = mockDb.exams.find((e) => e.id === submission.exam_id);
  if (!exam) return res.status(404).json({ error: 'Exam metadata not found' });

  const now = new Date().toISOString();
  submission.submitted_at = now;
  submission.auto_submitted = auto_submitted;
  submission.time_spent_seconds = time_spent_seconds;

  // AUTOMATED MCQ & NEGATIVE MARKING ENGINE
  let totalScore = 0;
  let hasDescriptiveQuestions = false;

  const examQuestions = mockDb.examQuestions.filter((eq) => eq.exam_id === exam.id);

  for (const eq of examQuestions) {
    const question = mockDb.questions.find((q) => q.id === eq.question_id);
    if (!question) continue;

    const studentAnswer = mockDb.studentAnswers.find(
      (a) => a.submission_id === submission.id && a.question_id === question.id
    );

    if (question.question_type === 'mcq') {
      if (studentAnswer && studentAnswer.selected_option_id) {
        const correctOption = mockDb.questionOptions.find(
          (o) => o.question_id === question.id && o.is_correct
        );

        if (correctOption && studentAnswer.selected_option_id === correctOption.id) {
          const marks = eq.points || question.default_marks;
          studentAnswer.marks_awarded = marks;
          totalScore += marks;
        } else {
          // Apply negative penalty
          const penalty = (eq.points || question.default_marks) * exam.negative_marking_rate;
          studentAnswer.marks_awarded = -penalty;
          totalScore -= penalty;
        }
      }
    } else if (question.question_type === 'descriptive') {
      hasDescriptiveQuestions = true;
    }
  }

  submission.total_score = Math.max(0, parseFloat(totalScore.toFixed(2)));
  submission.is_evaluated = !hasDescriptiveQuestions;

  return res.json({
    message: 'Exam submitted successfully and locked.',
    submission,
    total_score: submission.total_score,
    is_evaluated: submission.is_evaluated
  });
}
```

---

## 4. Core Frontend Architecture Code

### 4.1 Global TypeScript Domain Models
**Source File:** `apps/frontend/src/types/index.ts`

```typescript
export type UserRole = 'student' | 'faculty' | 'admin';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  department_id?: string;
  batch_id?: string;
  registration_number?: string;
  avatar_url?: string;
  status: 'active' | 'inactive' | 'suspended';
}

export interface QuestionOption {
  id: string;
  question_id?: string;
  option_text: string;
  is_correct?: boolean;
  option_order: number;
}

export interface Question {
  id: string;
  created_by: string;
  subject: string;
  topic?: string;
  question_type: 'mcq' | 'descriptive';
  question_text: string;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  default_marks: number;
  options?: QuestionOption[];
}

export interface Exam {
  id: string;
  title: string;
  subject: string;
  duration_minutes: number;
  total_marks: number;
  passing_marks: number;
  negative_marking_rate: number;
  question_selection_type: 'manual' | 'random';
  start_time: string;
  end_time: string;
  status: 'draft' | 'published' | 'ongoing' | 'completed' | 'archived';
  shuffle_questions: boolean;
  shuffle_options: boolean;
  results_published: boolean;
  questions?: Question[];
}

export interface LiveExamSession {
  submission_id: string;
  started_at: string;
  duration_minutes: number;
  title: string;
  subject: string;
  questions: StudentAnswerPayload[];
}
```

---

### 4.2 Auth State Provider & Session Store
**Source File:** `apps/frontend/src/context/AuthContext.tsx`

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password?: string, role?: UserRole) => Promise<UserProfile>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('oems_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('oems_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
          localStorage.setItem('oems_user', JSON.stringify(res.data.user));
        } catch (err) {
          logout();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email: string, password = 'password', role?: UserRole): Promise<UserProfile> => {
    const res = await api.post('/auth/login', { email, password, role });
    const { token: authToken, user: userProfile } = res.data;

    setToken(authToken);
    setUser(userProfile);
    localStorage.setItem('oems_token', authToken);
    localStorage.setItem('oems_user', JSON.stringify(userProfile));

    return userProfile;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('oems_token');
    localStorage.removeItem('oems_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
```

---

### 4.3 Client API Axios Instance
**Source File:** `apps/frontend/src/services/api.ts`

```typescript
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Automatic Bearer Token Interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('oems_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

### 4.4 Main Application Routing & Protected Routes
**Source File:** `apps/frontend/src/App.tsx`

```tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

import { Login } from './pages/auth/Login';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { LiveExam } from './pages/student/LiveExam';
import { FacultyDashboard } from './pages/faculty/FacultyDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';

const RootRedirect: React.FC = () => {
  const { user, token } = useAuth();
  if (!token || !user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'faculty') return <Navigate to="/faculty/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* Student Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/exams/:id" element={<LiveExam />} />
            </Route>

            {/* Faculty Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['faculty']} />}>
              <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
            </Route>

            {/* Admin Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Route>

            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};
```

---

## 5. Summary of System Specifications

| Domain | Mechanism | Key Implementation |
|---|---|---|
| **Database RLS** | Multi-tenant isolation | PostgreSQL row policies on `profiles`, `exams`, `submissions` |
| **Auth** | Bearer Token Verification | Hybrid support (Local JWT, Supabase Auth, Mock Token) |
| **Exam Engine** | Real-time autosave + Auto-Scoring | Immediate score calculation for MCQs with negative penalty |
| **Descriptive Grading** | Manual Faculty Evaluation | Faculty score adjustment and feedback per question |
| **Frontend State** | React Context + LocalStorage | Persistence across tab refreshes with session verification |
