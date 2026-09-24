"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.autosaveAnswer = autosaveAnswer;
exports.submitExam = submitExam;
exports.getSubmissionsForExam = getSubmissionsForExam;
exports.gradeDescriptiveSubmission = gradeDescriptiveSubmission;
const zod_1 = require("zod");
const uuid_1 = require("uuid");
const mockDb_js_1 = require("../services/mockDb.js");
async function autosaveAnswer(req, res) {
    const schema = zod_1.z.object({
        submission_id: zod_1.z.string().uuid(),
        question_id: zod_1.z.string().uuid(),
        selected_option_id: zod_1.z.string().optional(),
        descriptive_answer: zod_1.z.string().optional(),
        is_flagged: zod_1.z.boolean().optional()
    });
    const body = schema.parse(req.body);
    const submission = mockDb_js_1.mockDb.examSubmissions.find((s) => s.id === body.submission_id);
    if (!submission) {
        return res.status(404).json({ error: 'Exam submission session not found' });
    }
    // Submission Lock Guard
    if (submission.submitted_at) {
        return res.status(403).json({ error: 'Exam submission is locked. Answers cannot be updated.' });
    }
    let answer = mockDb_js_1.mockDb.studentAnswers.find((a) => a.submission_id === body.submission_id && a.question_id === body.question_id);
    const now = new Date().toISOString();
    if (!answer) {
        answer = {
            id: (0, uuid_1.v4)(),
            submission_id: body.submission_id,
            question_id: body.question_id,
            selected_option_id: body.selected_option_id,
            descriptive_answer: body.descriptive_answer,
            is_flagged: body.is_flagged || false,
            marks_awarded: 0,
            saved_at: now
        };
        mockDb_js_1.mockDb.studentAnswers.push(answer);
    }
    else {
        if (body.selected_option_id !== undefined)
            answer.selected_option_id = body.selected_option_id;
        if (body.descriptive_answer !== undefined)
            answer.descriptive_answer = body.descriptive_answer;
        if (body.is_flagged !== undefined)
            answer.is_flagged = body.is_flagged;
        answer.saved_at = now;
    }
    return res.json({ message: 'Answer autosaved', answer });
}
async function submitExam(req, res) {
    const schema = zod_1.z.object({
        submission_id: zod_1.z.string().uuid(),
        auto_submitted: zod_1.z.boolean().optional().default(false),
        time_spent_seconds: zod_1.z.number().optional().default(0)
    });
    const { submission_id, auto_submitted, time_spent_seconds } = schema.parse(req.body);
    const submission = mockDb_js_1.mockDb.examSubmissions.find((s) => s.id === submission_id);
    if (!submission) {
        return res.status(404).json({ error: 'Exam submission session not found' });
    }
    if (submission.submitted_at) {
        return res.status(400).json({ error: 'Exam has already been submitted.' });
    }
    const exam = mockDb_js_1.mockDb.exams.find((e) => e.id === submission.exam_id);
    if (!exam) {
        return res.status(404).json({ error: 'Exam metadata not found' });
    }
    const now = new Date().toISOString();
    submission.submitted_at = now;
    submission.auto_submitted = auto_submitted;
    submission.time_spent_seconds = time_spent_seconds;
    // AUTO-SCORING ENGINE (MCQ & Negative Marking)
    let totalScore = 0;
    let hasDescriptiveQuestions = false;
    const examQuestions = mockDb_js_1.mockDb.examQuestions.filter((eq) => eq.exam_id === exam.id);
    for (const eq of examQuestions) {
        const question = mockDb_js_1.mockDb.questions.find((q) => q.id === eq.question_id);
        if (!question)
            continue;
        const studentAnswer = mockDb_js_1.mockDb.studentAnswers.find((a) => a.submission_id === submission.id && a.question_id === question.id);
        if (question.question_type === 'mcq') {
            if (studentAnswer && studentAnswer.selected_option_id) {
                const correctOption = mockDb_js_1.mockDb.questionOptions.find((o) => o.question_id === question.id && o.is_correct);
                if (correctOption && studentAnswer.selected_option_id === correctOption.id) {
                    // Correct answer
                    const marks = eq.points || question.default_marks;
                    studentAnswer.marks_awarded = marks;
                    totalScore += marks;
                }
                else {
                    // Wrong answer -> Apply negative marking if configured
                    const penalty = (eq.points || question.default_marks) * exam.negative_marking_rate;
                    studentAnswer.marks_awarded = -penalty;
                    totalScore -= penalty;
                }
            }
            else {
                // Unanswered
                if (studentAnswer)
                    studentAnswer.marks_awarded = 0;
            }
        }
        else if (question.question_type === 'descriptive') {
            hasDescriptiveQuestions = true;
        }
    }
    // Ensure total score is non-negative
    submission.total_score = Math.max(0, parseFloat(totalScore.toFixed(2)));
    submission.is_evaluated = !hasDescriptiveQuestions; // If no descriptive questions, fully evaluated automatically!
    // Update assignment status
    const assignment = mockDb_js_1.mockDb.examAssignments.find((a) => a.exam_id === exam.id && a.student_id === submission.student_id);
    if (assignment) {
        assignment.status = submission.is_evaluated ? 'evaluated' : 'submitted';
    }
    mockDb_js_1.mockDb.logAudit('SUBMIT_EXAM', 'EXAM_SUBMISSION', submission.id, { score: submission.total_score, auto_submitted }, req.user?.id, req.user?.email);
    return res.json({
        message: 'Exam submitted successfully and locked.',
        submission,
        total_score: submission.total_score,
        is_evaluated: submission.is_evaluated
    });
}
async function getSubmissionsForExam(req, res) {
    const { examId } = req.params;
    const submissions = mockDb_js_1.mockDb.examSubmissions.filter((s) => s.exam_id === examId);
    const enriched = submissions.map((sub) => {
        const student = mockDb_js_1.mockDb.profiles.find((p) => p.id === sub.student_id);
        const answers = mockDb_js_1.mockDb.studentAnswers.filter((a) => a.submission_id === sub.id);
        return {
            ...sub,
            student_name: student ? student.full_name : 'Unknown Student',
            student_email: student ? student.email : 'N/A',
            registration_number: student ? student.registration_number : 'N/A',
            answer_count: answers.length
        };
    });
    return res.json(enriched);
}
async function gradeDescriptiveSubmission(req, res) {
    const { submissionId } = req.params;
    const schema = zod_1.z.object({
        feedback: zod_1.z.string().optional(),
        grades: zod_1.z.array(zod_1.z.object({
            question_id: zod_1.z.string().uuid(),
            marks_awarded: zod_1.z.number().nonnegative(),
            evaluation_feedback: zod_1.z.string().optional()
        }))
    });
    const { feedback, grades } = schema.parse(req.body);
    const submission = mockDb_js_1.mockDb.examSubmissions.find((s) => s.id === submissionId);
    if (!submission) {
        return res.status(404).json({ error: 'Submission not found' });
    }
    let totalScored = submission.total_score;
    for (const item of grades) {
        let answer = mockDb_js_1.mockDb.studentAnswers.find((a) => a.submission_id === submission.id && a.question_id === item.question_id);
        if (answer) {
            totalScored += item.marks_awarded;
            answer.marks_awarded = item.marks_awarded;
            answer.evaluation_feedback = item.evaluation_feedback;
        }
    }
    submission.total_score = Math.max(0, parseFloat(totalScored.toFixed(2)));
    submission.is_evaluated = true;
    if (feedback)
        submission.feedback = feedback;
    // Update assignment status
    const assignment = mockDb_js_1.mockDb.examAssignments.find((a) => a.exam_id === submission.exam_id && a.student_id === submission.student_id);
    if (assignment) {
        assignment.status = 'evaluated';
    }
    mockDb_js_1.mockDb.logAudit('GRADE_DESCRIPTIVE', 'EXAM_SUBMISSION', submissionId, { score: submission.total_score }, req.user?.id, req.user?.email);
    return res.json({ message: 'Submission evaluated and graded successfully', submission });
}
