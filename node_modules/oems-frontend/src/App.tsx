import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Auth Pages
import { Login } from './pages/auth/Login';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { Unauthorized } from './pages/auth/Unauthorized';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentProfile } from './pages/student/StudentProfile';
import { StudentExams } from './pages/student/StudentExams';
import { ExamInstructions } from './pages/student/ExamInstructions';
import { LiveExam } from './pages/student/LiveExam';
import { StudentResults } from './pages/student/StudentResults';
import { StudentResultDetail } from './pages/student/StudentResultDetail';

// Faculty Pages
import { FacultyDashboard } from './pages/faculty/FacultyDashboard';
import { FacultyQuestionBank } from './pages/faculty/FacultyQuestionBank';
import { FacultyAddQuestion } from './pages/faculty/FacultyAddQuestion';
import { FacultyExams } from './pages/faculty/FacultyExams';
import { FacultyCreateExam } from './pages/faculty/FacultyCreateExam';
import { FacultyResults } from './pages/faculty/FacultyResults';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminDepartments } from './pages/admin/AdminDepartments';
import { AdminBatches } from './pages/admin/AdminBatches';
import { AdminExams } from './pages/admin/AdminExams';
import { AdminQuestions } from './pages/admin/AdminQuestions';
import { AdminAuditLogs } from './pages/admin/AdminAuditLogs';

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
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Student Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/profile" element={<StudentProfile />} />
              <Route path="/student/exams" element={<StudentExams />} />
              <Route path="/student/exams/:id/instructions" element={<ExamInstructions />} />
              <Route path="/student/exams/:id" element={<LiveExam />} />
              <Route path="/student/results" element={<StudentResults />} />
              <Route path="/student/results/:id" element={<StudentResultDetail />} />
            </Route>

            {/* Faculty Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['faculty']} />}>
              <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
              <Route path="/faculty/questions" element={<FacultyQuestionBank />} />
              <Route path="/faculty/questions/new" element={<FacultyAddQuestion />} />
              <Route path="/faculty/questions/:id/edit" element={<FacultyAddQuestion />} />
              <Route path="/faculty/exams" element={<FacultyExams />} />
              <Route path="/faculty/exams/new" element={<FacultyCreateExam />} />
              <Route path="/faculty/exams/:id/edit" element={<FacultyCreateExam />} />
              <Route path="/faculty/results" element={<FacultyResults />} />
            </Route>

            {/* Admin Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/departments" element={<AdminDepartments />} />
              <Route path="/admin/batches" element={<AdminBatches />} />
              <Route path="/admin/exams" element={<AdminExams />} />
              <Route path="/admin/questions" element={<AdminQuestions />} />
              <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
            </Route>

            {/* Default Catch-all Redirect */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<RootRedirect />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
