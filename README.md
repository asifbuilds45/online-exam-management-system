# Online Exam Management System (OEMS) — Demo & Development Guide

A production-grade, role-based Online Exam Management System built with **React 18**, **TypeScript**, **Tailwind CSS**, **Node.js/Express**, **Supabase PostgreSQL**, and **Resend Mailer**.

---

## ⚡ Demo Mode (No Database Setup Required)

The application is fully runnable out-of-the-box using an **In-Memory Database Engine** pre-loaded with seed accounts. Real Supabase cloud connection is completely **optional and deferred** — all workflows (exam creation, proctored taking, grading, CSV exports, password resets) operate seamlessly in demo mode.

### 🚀 Quick Start Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Build Workspace**:
   ```bash
   npm run build
   ```

3. **Start Concurrent Full-Stack Application**:
   ```bash
   npm run dev
   ```
   * Frontend: `http://localhost:5173` (Vite SPA)
   * Backend API: `http://localhost:5000` (Express.js REST API)

---

## 🔑 Pre-Loaded Demo Accounts

Select any role on the `/login` screen or use these credentials:

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Student** | `student@college.edu` | `password` | Live exams, instructions, autosaving, scorecards |
| **Faculty** | `faculty@college.edu` | `password` | Question bank, exam publishing, grading, CSV export/import |
| **Admin** | `admin@college.edu` | `password` | User provisioning, department/batch config, audit logs |

---

## 🛠️ Key Technical Features Implemented

1. **Proctored Exam Taking**:
   * Mandatory agreement checkbox before exam start.
   * Real-time answer autosaving on option selection.
   * Server-side exam timing enforcement and duration lock.
   * Automatic submission upon time expiry.
   * Window focus & tab switching warning alerts.
   * Question Palette with visual indicators (Answered, Unanswered, Flagged).
   * Strict post-submission lock preventing session re-entry.

2. **Faculty Exam & Question Engine**:
   * CSV Question Import with row-by-row validation & error reporting.
   * Dynamic & Manual Exam Creation with negative marking rules.
   * Exam publish/unpublish workflow with edit-lock protection.
   * Descriptive question evaluation & grading workflow.
   * Export exam result analytics to downloadable CSV.

3. **User & System Administration**:
   * Comprehensive In-app Notification Center with unread badges & read/unread toggle.
   * `/forgot-password` and `/reset-password` flow in demo mode.
   * Protected Routes with role verification and `/unauthorized` fallback.
   * Real-time audit trail log monitoring.

---

## 📄 Documentation References
* Technical Architecture & Code Specification: [`SOURCE_CODE_DOCUMENTATION.md`](./SOURCE_CODE_DOCUMENTATION.md)
* Deployment & Supabase SQL Migration Guide: [`SETUP.md`](./SETUP.md)
