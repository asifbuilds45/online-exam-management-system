"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishResults = publishResults;
exports.getResults = getResults;
exports.getResultDetail = getResultDetail;
exports.exportResultsCSV = exportResultsCSV;
const uuid_1 = require("uuid");
const mockDb_js_1 = require("../services/mockDb.js");
const resend_js_1 = require("../config/resend.js");
async function publishResults(req, res) {
    const { examId } = req.params;
    const exam = mockDb_js_1.mockDb.exams.find((e) => e.id === examId);
    if (!exam) {
        return res.status(404).json({ error: 'Exam not found' });
    }
    // Get all evaluated submissions for this exam
    const submissions = mockDb_js_1.mockDb.examSubmissions.filter((s) => s.exam_id === examId && s.submitted_at);
    if (submissions.length === 0) {
        return res.status(400).json({ error: 'No student submissions found to publish results.' });
    }
    // Sort submissions descending by total score to calculate ranks
    submissions.sort((a, b) => b.total_score - a.total_score);
    // Clear old results if re-publishing
    mockDb_js_1.mockDb.results = mockDb_js_1.mockDb.results.filter((r) => r.exam_id !== examId);
    const now = new Date().toISOString();
    submissions.forEach((sub, index) => {
        const percentage = parseFloat(((sub.total_score / exam.total_marks) * 100).toFixed(2));
        const isPass = sub.total_score >= exam.passing_marks;
        const resultRecord = {
            id: (0, uuid_1.v4)(),
            exam_id: examId,
            student_id: sub.student_id,
            submission_id: sub.id,
            total_marks: exam.total_marks,
            marks_obtained: sub.total_score,
            percentage,
            rank: index + 1,
            status: isPass ? 'pass' : 'fail',
            published_at: now
        };
        mockDb_js_1.mockDb.results.push(resultRecord);
        // Send Notification & Email to Student
        const student = mockDb_js_1.mockDb.profiles.find((p) => p.id === sub.student_id);
        if (student) {
            const notif = {
                id: (0, uuid_1.v4)(),
                user_id: student.id,
                title: `Results Published: ${exam.title}`,
                message: `Your exam result for '${exam.title}' has been published. Score: ${sub.total_score}/${exam.total_marks} (${percentage}%), Rank: #${index + 1}.`,
                type: 'result_published',
                is_read: false,
                created_at: now
            };
            mockDb_js_1.mockDb.notifications.unshift(notif);
            (0, resend_js_1.sendEmail)({
                to: student.email,
                subject: `Exam Results Published: ${exam.title}`,
                html: `
          <h3>Hello ${student.full_name},</h3>
          <p>The results for <strong>${exam.title}</strong> have been published.</p>
          <ul>
            <li><strong>Marks Obtained:</strong> ${sub.total_score} / ${exam.total_marks}</li>
            <li><strong>Percentage:</strong> ${percentage}%</li>
            <li><strong>Rank:</strong> #${index + 1}</li>
            <li><strong>Status:</strong> <span style="color:${isPass ? 'green' : 'red'};">${isPass ? 'PASSED' : 'FAILED'}</span></li>
          </ul>
          <p>Log in to OEMS to view detailed answer keys and feedback.</p>
        `
            });
        }
    });
    exam.results_published = true;
    exam.updated_at = now;
    mockDb_js_1.mockDb.logAudit('PUBLISH_RESULTS', 'EXAM', examId, { count: submissions.length }, req.user?.id, req.user?.email);
    return res.json({ message: `Results published for ${submissions.length} students`, examId });
}
async function getResults(req, res) {
    const { exam_id } = req.query;
    const user = req.user;
    let list = [...mockDb_js_1.mockDb.results];
    if (user?.role === 'student') {
        list = list.filter((r) => r.student_id === user.id);
    }
    else if (exam_id) {
        list = list.filter((r) => r.exam_id === exam_id);
    }
    const enriched = list.map((r) => {
        const exam = mockDb_js_1.mockDb.exams.find((e) => e.id === r.exam_id);
        const student = mockDb_js_1.mockDb.profiles.find((p) => p.id === r.student_id);
        return {
            ...r,
            exam_title: exam ? exam.title : 'Unknown Exam',
            exam_subject: exam ? exam.subject : 'N/A',
            student_name: student ? student.full_name : 'Unknown Student',
            student_email: student ? student.email : 'N/A',
            registration_number: student ? student.registration_number : 'N/A'
        };
    });
    // Calculate statistics for faculty/admin if exam_id provided
    let statistics = null;
    if (exam_id && list.length > 0) {
        const scores = list.map((r) => r.marks_obtained);
        const passCount = list.filter((r) => r.status === 'pass').length;
        const total = list.length;
        const avg = parseFloat((scores.reduce((a, b) => a + b, 0) / total).toFixed(2));
        const highest = Math.max(...scores);
        const lowest = Math.min(...scores);
        const passRate = parseFloat(((passCount / total) * 100).toFixed(2));
        statistics = {
            total_students: total,
            average_score: avg,
            highest_score: highest,
            lowest_score: lowest,
            pass_count: passCount,
            pass_percentage: passRate
        };
    }
    return res.json({ results: enriched, statistics });
}
async function getResultDetail(req, res) {
    const { examId, studentId } = req.params;
    const currentUserId = req.user?.id;
    // Student can only view their own detailed result
    const targetStudentId = req.user?.role === 'student' ? currentUserId : studentId;
    const result = mockDb_js_1.mockDb.results.find((r) => r.exam_id === examId && r.student_id === targetStudentId);
    if (!result) {
        return res.status(404).json({ error: 'Result record not found or not published yet.' });
    }
    const exam = mockDb_js_1.mockDb.exams.find((e) => e.id === examId);
    const student = mockDb_js_1.mockDb.profiles.find((p) => p.id === targetStudentId);
    const submission = mockDb_js_1.mockDb.examSubmissions.find((s) => s.id === result.submission_id);
    // Detailed answer key review
    const examQuestions = mockDb_js_1.mockDb.examQuestions.filter((eq) => eq.exam_id === examId);
    const answerReview = examQuestions.map((eq) => {
        const q = mockDb_js_1.mockDb.questions.find((question) => question.id === eq.question_id);
        const options = mockDb_js_1.mockDb.questionOptions.filter((o) => o.question_id === eq.question_id);
        const studentAns = mockDb_js_1.mockDb.studentAnswers.find((a) => a.submission_id === submission?.id && a.question_id === eq.question_id);
        return {
            question_id: q?.id,
            question_text: q?.question_text,
            question_type: q?.question_type,
            explanation: q?.explanation,
            points: eq.points,
            options,
            selected_option_id: studentAns?.selected_option_id,
            descriptive_answer: studentAns?.descriptive_answer,
            marks_awarded: studentAns?.marks_awarded || 0,
            evaluation_feedback: studentAns?.evaluation_feedback
        };
    });
    return res.json({
        result,
        exam,
        student: {
            full_name: student?.full_name,
            email: student?.email,
            registration_number: student?.registration_number
        },
        submission: {
            started_at: submission?.started_at,
            submitted_at: submission?.submitted_at,
            time_spent_seconds: submission?.time_spent_seconds
        },
        answerReview
    });
}
async function exportResultsCSV(req, res) {
    const { examId } = req.params;
    const exam = mockDb_js_1.mockDb.exams.find((e) => e.id === examId);
    if (!exam) {
        return res.status(404).json({ error: 'Exam not found' });
    }
    const results = mockDb_js_1.mockDb.results.filter((r) => r.exam_id === examId);
    let csvContent = 'Registration Number,Student Name,Email,Score,Total Marks,Percentage,Rank,Status\n';
    results.forEach((r) => {
        const student = mockDb_js_1.mockDb.profiles.find((p) => p.id === r.student_id);
        csvContent += `"${student?.registration_number || 'N/A'}","${student?.full_name || 'N/A'}","${student?.email || 'N/A'}",${r.marks_obtained},${r.total_marks},${r.percentage},${r.rank || 'N/A'},${r.status.toUpperCase()}\n`;
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="exam-results-${examId}.csv"`);
    return res.send(csvContent);
}
