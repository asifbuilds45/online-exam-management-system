"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExams = getExams;
exports.getExamById = getExamById;
exports.createExam = createExam;
exports.publishExam = publishExam;
exports.startExam = startExam;
const zod_1 = require("zod");
const uuid_1 = require("uuid");
const mockDb_js_1 = require("../services/mockDb.js");
const resend_js_1 = require("../config/resend.js");
async function getExams(req, res) {
    const { status, subject } = req.query;
    const user = req.user;
    let list = [...mockDb_js_1.mockDb.exams];
    if (user?.role === 'student') {
        // Show published/ongoing/completed exams assigned to student's batch or department
        const assignedExamIds = mockDb_js_1.mockDb.examAssignments
            .filter((a) => a.student_id === user.id)
            .map((a) => a.exam_id);
        list = list.filter((e) => assignedExamIds.includes(e.id) ||
            (e.status !== 'draft' && e.batch_id === user.batch_id) ||
            (e.status !== 'draft' && !e.batch_id));
    }
    else if (user?.role === 'faculty') {
        // Show exams created by faculty or all system exams
        list = list.filter((e) => e.created_by === user.id || user.role === 'faculty');
    }
    if (status) {
        list = list.filter((e) => e.status === status);
    }
    if (subject) {
        list = list.filter((e) => e.subject.toLowerCase() === String(subject).toLowerCase());
    }
    const enriched = list.map((e) => {
        const dept = mockDb_js_1.mockDb.departments.find((d) => d.id === e.department_id);
        const batch = mockDb_js_1.mockDb.batches.find((b) => b.id === e.batch_id);
        const qCount = mockDb_js_1.mockDb.examQuestions.filter((eq) => eq.exam_id === e.id).length;
        const assignmentCount = mockDb_js_1.mockDb.examAssignments.filter((ea) => ea.exam_id === e.id).length;
        // Check student submission status if user is student
        let userSubmissionStatus = 'pending';
        if (user?.role === 'student') {
            const sub = mockDb_js_1.mockDb.examSubmissions.find((s) => s.exam_id === e.id && s.student_id === user.id);
            if (sub) {
                userSubmissionStatus = sub.submitted_at ? 'submitted' : 'in_progress';
            }
        }
        return {
            ...e,
            department_name: dept ? dept.name : 'All Departments',
            batch_name: batch ? batch.name : 'All Batches',
            question_count: qCount,
            assigned_student_count: assignmentCount,
            user_submission_status: userSubmissionStatus
        };
    });
    return res.json(enriched);
}
async function getExamById(req, res) {
    const { id } = req.params;
    const exam = mockDb_js_1.mockDb.exams.find((e) => e.id === id);
    if (!exam) {
        return res.status(404).json({ error: 'Exam not found' });
    }
    // Get associated questions
    const examQLinks = mockDb_js_1.mockDb.examQuestions.filter((eq) => eq.exam_id === id);
    const questions = examQLinks
        .map((link) => {
        const q = mockDb_js_1.mockDb.questions.find((question) => question.id === link.question_id && !question.is_deleted);
        if (!q)
            return null;
        const options = mockDb_js_1.mockDb.questionOptions.filter((o) => o.question_id === q.id);
        // If student user, hide correct answer flag from options
        const sanitizedOptions = options.map((opt) => ({
            id: opt.id,
            question_id: opt.question_id,
            option_text: opt.option_text,
            option_order: opt.option_order,
            ...(req.user?.role !== 'student' ? { is_correct: opt.is_correct } : {})
        }));
        return {
            ...q,
            points: link.points,
            order_index: link.order_index,
            options: sanitizedOptions
        };
    })
        .filter(Boolean);
    const dept = mockDb_js_1.mockDb.departments.find((d) => d.id === exam.department_id);
    const batch = mockDb_js_1.mockDb.batches.find((b) => b.id === exam.batch_id);
    return res.json({
        ...exam,
        department_name: dept ? dept.name : 'All Departments',
        batch_name: batch ? batch.name : 'All Batches',
        questions
    });
}
async function createExam(req, res) {
    const schema = zod_1.z.object({
        title: zod_1.z.string().min(3),
        subject: zod_1.z.string().min(2),
        description: zod_1.z.string().optional(),
        duration_minutes: zod_1.z.number().positive(),
        total_marks: zod_1.z.number().positive(),
        passing_marks: zod_1.z.number().nonnegative(),
        negative_marking_rate: zod_1.z.number().nonnegative().default(0),
        question_selection_type: zod_1.z.enum(['manual', 'random']).default('manual'),
        department_id: zod_1.z.string().optional(),
        batch_id: zod_1.z.string().optional(),
        start_time: zod_1.z.string(),
        end_time: zod_1.z.string(),
        question_ids: zod_1.z.array(zod_1.z.string()).optional(),
        random_rules: zod_1.z
            .object({
            count: zod_1.z.number().positive(),
            difficulty: zod_1.z.enum(['easy', 'medium', 'hard']).optional()
        })
            .optional()
    });
    const body = schema.parse(req.body);
    const examId = (0, uuid_1.v4)();
    const now = new Date().toISOString();
    const newExam = {
        id: examId,
        created_by: req.user?.id || 'system',
        department_id: body.department_id,
        batch_id: body.batch_id,
        title: body.title,
        subject: body.subject,
        description: body.description,
        duration_minutes: body.duration_minutes,
        total_marks: body.total_marks,
        passing_marks: body.passing_marks,
        negative_marking_rate: body.negative_marking_rate,
        question_selection_type: body.question_selection_type,
        start_time: body.start_time,
        end_time: body.end_time,
        status: 'draft',
        shuffle_questions: true,
        shuffle_options: true,
        results_published: false,
        created_at: now,
        updated_at: now
    };
    mockDb_js_1.mockDb.exams.unshift(newExam);
    // Link selected questions
    let selectedQIds = [];
    if (body.question_selection_type === 'manual' && body.question_ids) {
        selectedQIds = body.question_ids;
    }
    else if (body.question_selection_type === 'random' && body.random_rules) {
        let pool = mockDb_js_1.mockDb.questions.filter((q) => q.subject.toLowerCase() === body.subject.toLowerCase() && !q.is_deleted);
        if (body.random_rules.difficulty) {
            pool = pool.filter((q) => q.difficulty === body.random_rules?.difficulty);
        }
        selectedQIds = pool.slice(0, body.random_rules.count).map((q) => q.id);
    }
    selectedQIds.forEach((qId, idx) => {
        const qObj = mockDb_js_1.mockDb.questions.find((q) => q.id === qId);
        mockDb_js_1.mockDb.examQuestions.push({
            id: (0, uuid_1.v4)(),
            exam_id: examId,
            question_id: qId,
            points: qObj ? qObj.default_marks : 2,
            order_index: idx + 1
        });
    });
    // Assign students from target batch
    if (body.batch_id) {
        const targetStudents = mockDb_js_1.mockDb.profiles.filter((p) => p.role === 'student' && p.batch_id === body.batch_id);
        targetStudents.forEach((st) => {
            mockDb_js_1.mockDb.examAssignments.push({
                id: (0, uuid_1.v4)(),
                exam_id: examId,
                student_id: st.id,
                assigned_at: now,
                status: 'pending'
            });
        });
    }
    mockDb_js_1.mockDb.logAudit('CREATE_EXAM', 'EXAM', examId, { title: body.title, subject: body.subject }, req.user?.id, req.user?.email);
    return res.status(201).json(newExam);
}
async function publishExam(req, res) {
    const { id } = req.params;
    const exam = mockDb_js_1.mockDb.exams.find((e) => e.id === id);
    if (!exam) {
        return res.status(404).json({ error: 'Exam not found' });
    }
    exam.status = exam.status === 'published' ? 'draft' : 'published';
    exam.updated_at = new Date().toISOString();
    // If published, notify assigned students
    if (exam.status === 'published') {
        const assignments = mockDb_js_1.mockDb.examAssignments.filter((a) => a.exam_id === id);
        assignments.forEach(async (assign) => {
            const student = mockDb_js_1.mockDb.profiles.find((p) => p.id === assign.student_id);
            if (student) {
                // Notification record
                const notif = {
                    id: (0, uuid_1.v4)(),
                    user_id: student.id,
                    title: `Exam Published: ${exam.title}`,
                    message: `The exam '${exam.title}' (${exam.subject}) has been published. Duration: ${exam.duration_minutes} mins.`,
                    type: 'exam_published',
                    is_read: false,
                    created_at: new Date().toISOString()
                };
                mockDb_js_1.mockDb.notifications.unshift(notif);
                // Send Email via Resend
                await (0, resend_js_1.sendEmail)({
                    to: student.email,
                    subject: `New Exam Published: ${exam.title}`,
                    html: `
            <h3>Hello ${student.full_name},</h3>
            <p>Your faculty has published a new examination: <strong>${exam.title}</strong>.</p>
            <ul>
              <li><strong>Subject:</strong> ${exam.subject}</li>
              <li><strong>Duration:</strong> ${exam.duration_minutes} Minutes</li>
              <li><strong>Start Time:</strong> ${new Date(exam.start_time).toLocaleString()}</li>
            </ul>
            <p>Please log in to your OEMS dashboard to review instructions and take the test.</p>
          `,
                    text: `Exam ${exam.title} published.`
                });
            }
        });
    }
    mockDb_js_1.mockDb.logAudit('TOGGLE_PUBLISH_EXAM', 'EXAM', id, { status: exam.status }, req.user?.id, req.user?.email);
    return res.json({ message: `Exam status changed to ${exam.status}`, exam });
}
async function startExam(req, res) {
    const { id } = req.params;
    const userId = req.user?.id;
    const exam = mockDb_js_1.mockDb.exams.find((e) => e.id === id);
    if (!exam) {
        return res.status(404).json({ error: 'Exam not found' });
    }
    if (exam.status !== 'published' && exam.status !== 'ongoing') {
        return res.status(400).json({ error: 'This exam is not active or published.' });
    }
    let submission = mockDb_js_1.mockDb.examSubmissions.find((s) => s.exam_id === id && s.student_id === userId);
    // Submission lock check: Cannot re-enter if already submitted
    if (submission && submission.submitted_at) {
        return res.status(403).json({
            error: 'Submission Locked: You have already submitted this exam and cannot re-enter.',
            submitted_at: submission.submitted_at
        });
    }
    const now = new Date().toISOString();
    if (!submission) {
        submission = {
            id: (0, uuid_1.v4)(),
            exam_id: id,
            student_id: userId || 'student',
            started_at: now,
            time_spent_seconds: 0,
            auto_submitted: false,
            total_score: 0,
            is_evaluated: false,
            created_at: now
        };
        mockDb_js_1.mockDb.examSubmissions.push(submission);
        // Update assignment status
        const assignment = mockDb_js_1.mockDb.examAssignments.find((a) => a.exam_id === id && a.student_id === userId);
        if (assignment) {
            assignment.status = 'in_progress';
        }
    }
    mockDb_js_1.mockDb.logAudit('START_EXAM_SESSION', 'EXAM_SUBMISSION', submission.id, { exam_id: id }, req.user?.id, req.user?.email);
    // Return exam session payload
    const examQuestions = mockDb_js_1.mockDb.examQuestions.filter((eq) => eq.exam_id === id);
    const questionsPayload = examQuestions
        .map((eq) => {
        const q = mockDb_js_1.mockDb.questions.find((question) => question.id === eq.question_id && !question.is_deleted);
        if (!q)
            return null;
        const opts = mockDb_js_1.mockDb.questionOptions
            .filter((o) => o.question_id === q.id)
            .map((o) => ({ id: o.id, option_text: o.option_text, option_order: o.option_order }));
        const savedAnswer = mockDb_js_1.mockDb.studentAnswers.find((ans) => ans.submission_id === submission?.id && ans.question_id === q.id);
        return {
            id: q.id,
            question_text: q.question_text,
            question_type: q.question_type,
            subject: q.subject,
            topic: q.topic,
            difficulty: q.difficulty,
            points: eq.points,
            options: opts,
            saved_selected_option_id: savedAnswer?.selected_option_id,
            saved_descriptive_answer: savedAnswer?.descriptive_answer,
            is_flagged: savedAnswer?.is_flagged || false
        };
    })
        .filter(Boolean);
    return res.json({
        submission_id: submission.id,
        started_at: submission.started_at,
        duration_minutes: exam.duration_minutes,
        title: exam.title,
        subject: exam.subject,
        questions: questionsPayload
    });
}
