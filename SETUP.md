# Setup Guide - Online Exam Management System (OEMS)

This full-stack application provides a secure, role-based exam management platform built with **React**, **TypeScript**, **Tailwind CSS**, **Node.js/Express**, **Supabase PostgreSQL & Auth**, and **Resend** transactional emails.

---

## 🚀 Quick Start (Demo Mode)

The application includes an **in-memory database engine** pre-loaded with realistic seed accounts. You can run and test the complete system out-of-the-box without requiring an active Supabase URL.

### 1. Install Workspace Dependencies

Run from the project root:
```bash
npm install
```

### 2. Run the Full-Stack Application

Launch both backend (`http://localhost:5000`) and frontend (`http://localhost:5173`) concurrently:
```bash
npm run dev
```

### 3. Pre-loaded Demo Accounts

Click the role selector pills on the `/login` screen or use the following credentials:

* **Student Role**:
  * Email: `student@college.edu`
  * Password: `password`
* **Faculty Role**:
  * Email: `faculty@college.edu`
  * Password: `password`
* **Admin Role**:
  * Email: `admin@college.edu`
  * Password: `password`

---

## 🗄️ Connecting Live Supabase & Resend API

To transition from Mock Demo mode to live Supabase cloud database and live email delivery:

### 1. Configure `.env` File

Copy `.env.example` to `.env` in the root directory:
```bash
cp .env.example .env
```

Populate the following variables:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

RESEND_API_KEY=re_your_resend_api_key_here
FROM_EMAIL=oems-notifications@college.edu
```

### 2. Execute Supabase Database Migration

1. Go to your **Supabase Dashboard** -> **SQL Editor**.
2. Run the SQL DDL migration script located at:
   `supabase/migrations/20260923000000_init_schema.sql`
3. Seed default college departments, batches, and profiles by running:
   `supabase/seed.sql`

---

## 🧪 Testing & Commands

* **Build Backend**: `npm run build:backend`
* **Build Frontend**: `npm run build:frontend`
* **Full Production Build**: `npm run build`
* **Check API Health**: `curl http://localhost:5000/api/health`
