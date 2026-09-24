"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuestions = getQuestions;
exports.getQuestionById = getQuestionById;
exports.createQuestion = createQuestion;
exports.updateQuestion = updateQuestion;
exports.deleteQuestion = deleteQuestion;
exports.importCSV = importCSV;
const zod_1 = require("zod");
const uuid_1 = require("uuid");
const mockDb_js_1 = require("../services/mockDb.js");
async function getQuestions(req, res) {
    const { subject, difficulty, question_type, search } = req.query;
    let list = mockDb_js_1.mockDb.questions.filter((q) => !q.is_deleted);
    if (subject) {
        list = list.filter((q) => q.subject.toLowerCase() === String(subject).toLowerCase());
    }
    if (difficulty) {
        list = list.filter((q) => q.difficulty === difficulty);
    }
    if (question_type) {
        list = list.filter((q) => q.question_type === question_type);
    }
    if (search) {
        const qStr = String(search).toLowerCase();
        list = list.filter((q) => q.question_text.toLowerCase().includes(qStr) ||
            (q.topic && q.topic.toLowerCase().includes(qStr)) ||
            q.subject.toLowerCase().includes(qStr));
    }
    const enriched = list.map((q) => {
        const options = mockDb_js_1.mockDb.questionOptions.filter((o) => o.question_id === q.id);
        return {
            ...q,
            options
        };
    });
    return res.json(enriched);
}
async function getQuestionById(req, res) {
    const { id } = req.params;
    const question = mockDb_js_1.mockDb.questions.find((q) => q.id === id && !q.is_deleted);
    if (!question) {
        return res.status(404).json({ error: 'Question not found' });
    }
    const options = mockDb_js_1.mockDb.questionOptions.filter((o) => o.question_id === question.id);
    return res.json({ ...question, options });
}
async function createQuestion(req, res) {
    const schema = zod_1.z.object({
        subject: zod_1.z.string().min(1),
        topic: zod_1.z.string().optional(),
        question_type: zod_1.z.enum(['mcq', 'descriptive']),
        question_text: zod_1.z.string().min(3),
        explanation: zod_1.z.string().optional(),
        difficulty: zod_1.z.enum(['easy', 'medium', 'hard']),
        default_marks: zod_1.z.number().positive(),
        options: zod_1.z
            .array(zod_1.z.object({
            option_text: zod_1.z.string().min(1),
            is_correct: zod_1.z.boolean()
        }))
            .optional()
    });
    const body = schema.parse(req.body);
    const questionId = (0, uuid_1.v4)();
    const now = new Date().toISOString();
    const newQuestion = {
        id: questionId,
        created_by: req.user?.id || 'system',
        subject: body.subject,
        topic: body.topic,
        question_type: body.question_type,
        question_text: body.question_text,
        explanation: body.explanation,
        difficulty: body.difficulty,
        default_marks: body.default_marks,
        is_deleted: false,
        created_at: now,
        updated_at: now
    };
    mockDb_js_1.mockDb.questions.unshift(newQuestion);
    const createdOptions = [];
    if (body.question_type === 'mcq' && body.options && body.options.length > 0) {
        body.options.forEach((opt, idx) => {
            const optionObj = {
                id: (0, uuid_1.v4)(),
                question_id: questionId,
                option_text: opt.option_text,
                is_correct: opt.is_correct,
                option_order: idx + 1
            };
            mockDb_js_1.mockDb.questionOptions.push(optionObj);
            createdOptions.push(optionObj);
        });
    }
    mockDb_js_1.mockDb.logAudit('CREATE_QUESTION', 'QUESTION', questionId, { subject: body.subject, type: body.question_type }, req.user?.id, req.user?.email);
    return res.status(201).json({
        ...newQuestion,
        options: createdOptions
    });
}
async function updateQuestion(req, res) {
    const { id } = req.params;
    const question = mockDb_js_1.mockDb.questions.find((q) => q.id === id && !q.is_deleted);
    if (!question) {
        return res.status(404).json({ error: 'Question not found' });
    }
    const schema = zod_1.z.object({
        subject: zod_1.z.string().optional(),
        topic: zod_1.z.string().optional(),
        question_text: zod_1.z.string().optional(),
        explanation: zod_1.z.string().optional(),
        difficulty: zod_1.z.enum(['easy', 'medium', 'hard']).optional(),
        default_marks: zod_1.z.number().positive().optional(),
        options: zod_1.z
            .array(zod_1.z.object({
            option_text: zod_1.z.string(),
            is_correct: zod_1.z.boolean()
        }))
            .optional()
    });
    const body = schema.parse(req.body);
    Object.assign(question, body, { updated_at: new Date().toISOString() });
    if (body.options && question.question_type === 'mcq') {
        // Replace options
        mockDb_js_1.mockDb.questionOptions = mockDb_js_1.mockDb.questionOptions.filter((o) => o.question_id !== id);
        body.options.forEach((opt, idx) => {
            mockDb_js_1.mockDb.questionOptions.push({
                id: (0, uuid_1.v4)(),
                question_id: id,
                option_text: opt.option_text,
                is_correct: opt.is_correct,
                option_order: idx + 1
            });
        });
    }
    mockDb_js_1.mockDb.logAudit('UPDATE_QUESTION', 'QUESTION', id, body, req.user?.id, req.user?.email);
    const updatedOptions = mockDb_js_1.mockDb.questionOptions.filter((o) => o.question_id === id);
    return res.json({ ...question, options: updatedOptions });
}
async function deleteQuestion(req, res) {
    const { id } = req.params;
    const question = mockDb_js_1.mockDb.questions.find((q) => q.id === id);
    if (!question) {
        return res.status(404).json({ error: 'Question not found' });
    }
    // Soft delete flag
    question.is_deleted = true;
    question.updated_at = new Date().toISOString();
    mockDb_js_1.mockDb.logAudit('DELETE_QUESTION', 'QUESTION', id, { question_text: question.question_text }, req.user?.id, req.user?.email);
    return res.json({ message: 'Question soft deleted successfully' });
}
async function importCSV(req, res) {
    const { csvText } = zod_1.z.object({ csvText: zod_1.z.string().min(5) }).parse(req.body);
    const lines = csvText.split('\n').filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
        return res.status(400).json({ error: 'CSV text must contain header and at least 1 data row' });
    }
    let importedCount = 0;
    const now = new Date().toISOString();
    // Simple CSV parser supporting format:
    // Subject,Topic,Type,QuestionText,Difficulty,Marks,OptA,OptB,OptC,OptD,CorrectOpt
    for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.trim().replace(/^"(.*)"$/, '$1'));
        if (cols.length >= 6) {
            const [subject, topic, type, text, difficulty, marks, optA, optB, optC, optD, correctOpt] = cols;
            const qId = (0, uuid_1.v4)();
            const qType = (type || 'mcq').toLowerCase() === 'descriptive' ? 'descriptive' : 'mcq';
            const qDiff = ['easy', 'medium', 'hard'].includes((difficulty || '').toLowerCase())
                ? difficulty.toLowerCase()
                : 'medium';
            const questionObj = {
                id: qId,
                created_by: req.user?.id || 'system',
                subject: subject || 'General',
                topic: topic || 'General',
                question_type: qType,
                question_text: text || 'Sample Question',
                difficulty: qDiff,
                default_marks: parseFloat(marks) || 2,
                is_deleted: false,
                created_at: now,
                updated_at: now
            };
            mockDb_js_1.mockDb.questions.unshift(questionObj);
            if (qType === 'mcq' && optA && optB) {
                const optionsList = [optA, optB, optC, optD].filter(Boolean);
                const correctLetter = (correctOpt || 'A').toUpperCase();
                optionsList.forEach((optText, idx) => {
                    const letter = String.fromCharCode(65 + idx);
                    mockDb_js_1.mockDb.questionOptions.push({
                        id: (0, uuid_1.v4)(),
                        question_id: qId,
                        option_text: optText,
                        is_correct: letter === correctLetter,
                        option_order: idx + 1
                    });
                });
            }
            importedCount++;
        }
    }
    mockDb_js_1.mockDb.logAudit('IMPORT_QUESTIONS_CSV', 'QUESTION', undefined, { count: importedCount }, req.user?.id, req.user?.email);
    return res.json({ message: `Successfully imported ${importedCount} questions`, count: importedCount });
}
