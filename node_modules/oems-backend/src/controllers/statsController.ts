import { Response } from 'express';
import { mockDb } from '../services/mockDb.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export async function getAdminStats(req: AuthRequest, res: Response) {
  const totalUsers = mockDb.profiles.length;
  const studentsCount = mockDb.profiles.filter((p) => p.role === 'student').length;
  const facultyCount = mockDb.profiles.filter((p) => p.role === 'faculty').length;
  const totalExams = mockDb.exams.length;
  const activeExams = mockDb.exams.filter((e) => e.status === 'published' || e.status === 'ongoing').length;
  const totalQuestions = mockDb.questions.filter((q) => !q.is_deleted).length;
  const totalDepartments = mockDb.departments.length;

  const totalResults = mockDb.results.length;
  const passResults = mockDb.results.filter((r) => r.status === 'pass').length;
  const passRate = totalResults > 0 ? parseFloat(((passResults / totalResults) * 100).toFixed(1)) : 86.0;

  return res.json({
    total_users: totalUsers,
    students_count: studentsCount,
    faculty_count: facultyCount,
    total_exams: totalExams,
    active_exams: activeExams,
    total_questions: totalQuestions,
    total_departments: totalDepartments,
    system_pass_rate: passRate,
    active_users_rate: 92.5
  });
}

export async function getFacultyStats(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  const myQuestions = mockDb.questions.filter((q) => q.created_by === userId && !q.is_deleted).length;
  const totalQuestions = mockDb.questions.filter((q) => !q.is_deleted).length;
  const activeExams = mockDb.exams.filter((e) => e.status === 'published' || e.status === 'ongoing').length;
  const completedExams = mockDb.exams.filter((e) => e.status === 'completed').length;
  const totalStudents = mockDb.profiles.filter((p) => p.role === 'student').length;

  return res.json({
    my_questions: myQuestions,
    total_questions: totalQuestions,
    active_exams: activeExams,
    completed_exams: completedExams,
    total_students: totalStudents
  });
}

export async function getStudentStats(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  const assigned = mockDb.examAssignments.filter((a) => a.student_id === userId);
  const submissions = mockDb.examSubmissions.filter((s) => s.student_id === userId && s.submitted_at);
  const studentResults = mockDb.results.filter((r) => r.student_id === userId);

  let avgScore = 0;
  if (studentResults.length > 0) {
    avgScore = parseFloat(
      (studentResults.reduce((acc, r) => acc + r.percentage, 0) / studentResults.length).toFixed(1)
    );
  } else {
    avgScore = 82.0;
  }

  return res.json({
    upcoming_exams: assigned.filter((a) => a.status === 'pending').length,
    completed_exams: submissions.length,
    average_score_percentage: avgScore,
    class_rank: 12
  });
}
