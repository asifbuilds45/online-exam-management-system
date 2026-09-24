"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminStats = getAdminStats;
exports.getFacultyStats = getFacultyStats;
exports.getStudentStats = getStudentStats;
const mockDb_js_1 = require("../services/mockDb.js");
async function getAdminStats(req, res) {
    const totalUsers = mockDb_js_1.mockDb.profiles.length;
    const studentsCount = mockDb_js_1.mockDb.profiles.filter((p) => p.role === 'student').length;
    const facultyCount = mockDb_js_1.mockDb.profiles.filter((p) => p.role === 'faculty').length;
    const totalExams = mockDb_js_1.mockDb.exams.length;
    const activeExams = mockDb_js_1.mockDb.exams.filter((e) => e.status === 'published' || e.status === 'ongoing').length;
    const totalQuestions = mockDb_js_1.mockDb.questions.filter((q) => !q.is_deleted).length;
    const totalDepartments = mockDb_js_1.mockDb.departments.length;
    const totalResults = mockDb_js_1.mockDb.results.length;
    const passResults = mockDb_js_1.mockDb.results.filter((r) => r.status === 'pass').length;
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
async function getFacultyStats(req, res) {
    const userId = req.user?.id;
    const myQuestions = mockDb_js_1.mockDb.questions.filter((q) => q.created_by === userId && !q.is_deleted).length;
    const totalQuestions = mockDb_js_1.mockDb.questions.filter((q) => !q.is_deleted).length;
    const activeExams = mockDb_js_1.mockDb.exams.filter((e) => e.status === 'published' || e.status === 'ongoing').length;
    const completedExams = mockDb_js_1.mockDb.exams.filter((e) => e.status === 'completed').length;
    const totalStudents = mockDb_js_1.mockDb.profiles.filter((p) => p.role === 'student').length;
    return res.json({
        my_questions: myQuestions,
        total_questions: totalQuestions,
        active_exams: activeExams,
        completed_exams: completedExams,
        total_students: totalStudents
    });
}
async function getStudentStats(req, res) {
    const userId = req.user?.id;
    const assigned = mockDb_js_1.mockDb.examAssignments.filter((a) => a.student_id === userId);
    const submissions = mockDb_js_1.mockDb.examSubmissions.filter((s) => s.student_id === userId && s.submitted_at);
    const studentResults = mockDb_js_1.mockDb.results.filter((r) => r.student_id === userId);
    let avgScore = 0;
    if (studentResults.length > 0) {
        avgScore = parseFloat((studentResults.reduce((acc, r) => acc + r.percentage, 0) / studentResults.length).toFixed(1));
    }
    else {
        avgScore = 82.0;
    }
    return res.json({
        upcoming_exams: assigned.filter((a) => a.status === 'pending').length,
        completed_exams: submissions.length,
        average_score_percentage: avgScore,
        class_rank: 12
    });
}
