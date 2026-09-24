"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockDb = void 0;
const uuid_1 = require("uuid");
class MockDatabase {
    departments = [];
    batches = [];
    profiles = [];
    questions = [];
    questionOptions = [];
    exams = [];
    examQuestions = [];
    examAssignments = [];
    examSubmissions = [];
    studentAnswers = [];
    results = [];
    notifications = [];
    auditLogs = [];
    constructor() {
        this.seed();
    }
    seed() {
        const now = new Date().toISOString();
        const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        const pastDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
        // 1. Departments
        const deptCSE = {
            id: '11111111-1111-1111-1111-111111111111',
            name: 'Computer Science & Engineering',
            code: 'CSE',
            created_at: now
        };
        const deptECE = {
            id: '22222222-2222-2222-2222-222222222222',
            name: 'Electronics & Communication',
            code: 'ECE',
            created_at: now
        };
        this.departments.push(deptCSE, deptECE);
        // 2. Batches
        const batchCSE2024 = {
            id: 'a1111111-1111-1111-1111-111111111111',
            department_id: deptCSE.id,
            name: 'CSE 2024-2028',
            start_year: 2024,
            end_year: 2028,
            created_at: now
        };
        const batchCSE2023 = {
            id: 'a2222222-2222-2222-2222-222222222222',
            department_id: deptCSE.id,
            name: 'CSE 2023-2027',
            start_year: 2023,
            end_year: 2027,
            created_at: now
        };
        this.batches.push(batchCSE2024, batchCSE2023);
        // 3. Profiles
        const adminProfile = {
            id: '00000000-0000-0000-0000-000000000001',
            full_name: 'System Administrator',
            email: 'admin@college.edu',
            role: 'admin',
            department_id: deptCSE.id,
            registration_number: 'ADM-001',
            phone: '+1 800 555 0100',
            status: 'active',
            created_at: now,
            updated_at: now
        };
        const facultyProfile = {
            id: '00000000-0000-0000-0000-000000000002',
            full_name: 'Dr. Priya Sharma',
            email: 'faculty@college.edu',
            role: 'faculty',
            department_id: deptCSE.id,
            registration_number: 'FAC-001',
            phone: '+1 800 555 0101',
            status: 'active',
            created_at: now,
            updated_at: now
        };
        const studentProfile1 = {
            id: '00000000-0000-0000-0000-000000000003',
            full_name: 'Arun Kumar',
            email: 'student@college.edu',
            role: 'student',
            department_id: deptCSE.id,
            batch_id: batchCSE2024.id,
            registration_number: '24CSE001',
            phone: '+1 800 555 0102',
            status: 'active',
            created_at: now,
            updated_at: now
        };
        const studentProfile2 = {
            id: '00000000-0000-0000-0000-000000000004',
            full_name: 'Ananya Roy',
            email: 'ananya@college.edu',
            role: 'student',
            department_id: deptCSE.id,
            batch_id: batchCSE2024.id,
            registration_number: '24CSE002',
            phone: '+1 800 555 0103',
            status: 'active',
            created_at: now,
            updated_at: now
        };
        this.profiles.push(adminProfile, facultyProfile, studentProfile1, studentProfile2);
        // 4. Questions & Options
        const q1Id = 'b1111111-1111-1111-1111-111111111111';
        const q1 = {
            id: q1Id,
            created_by: facultyProfile.id,
            subject: 'DBMS',
            topic: 'Relational Algebra',
            question_type: 'mcq',
            question_text: 'What is the primary purpose of a primary key in a relational database?',
            explanation: 'A primary key uniquely identifies each row/record in a database table.',
            difficulty: 'easy',
            default_marks: 2,
            is_deleted: false,
            created_at: now,
            updated_at: now
        };
        const o1_1 = { id: 'c1', question_id: q1Id, option_text: 'To uniquely identify each record', is_correct: true, option_order: 1 };
        const o1_2 = { id: 'c2', question_id: q1Id, option_text: 'To store duplicate rows', is_correct: false, option_order: 2 };
        const o1_3 = { id: 'c3', question_id: q1Id, option_text: 'To encrypt table columns', is_correct: false, option_order: 3 };
        const o1_4 = { id: 'c4', question_id: q1Id, option_text: 'To create database backups', is_correct: false, option_order: 4 };
        const q2Id = 'b2222222-2222-2222-2222-222222222222';
        const q2 = {
            id: q2Id,
            created_by: facultyProfile.id,
            subject: 'DBMS',
            topic: 'Normalization',
            question_type: 'mcq',
            question_text: 'Which normal form eliminates partial dependency of non-key attributes on candidate keys?',
            explanation: 'Second Normal Form (2NF) enforces full functional dependency on the primary key.',
            difficulty: 'medium',
            default_marks: 2,
            is_deleted: false,
            created_at: now,
            updated_at: now
        };
        const o2_1 = { id: 'c5', question_id: q2Id, option_text: '1NF', is_correct: false, option_order: 1 };
        const o2_2 = { id: 'c6', question_id: q2Id, option_text: '2NF', is_correct: true, option_order: 2 };
        const o2_3 = { id: 'c7', question_id: q2Id, option_text: '3NF', is_correct: false, option_order: 3 };
        const o2_4 = { id: 'c8', question_id: q2Id, option_text: 'BCNF', is_correct: false, option_order: 4 };
        const q3Id = 'b3333333-3333-3333-3333-333333333333';
        const q3 = {
            id: q3Id,
            created_by: facultyProfile.id,
            subject: 'DBMS',
            topic: 'Transactions',
            question_type: 'descriptive',
            question_text: 'Explain the ACID properties of database transactions with real-world examples.',
            explanation: 'Atomicity, Consistency, Isolation, and Durability guarantee transaction reliability.',
            difficulty: 'hard',
            default_marks: 6,
            is_deleted: false,
            created_at: now,
            updated_at: now
        };
        const q4Id = 'b4444444-4444-4444-4444-444444444444';
        const q4 = {
            id: q4Id,
            created_by: facultyProfile.id,
            subject: 'Operating Systems',
            topic: 'Process Management',
            question_type: 'mcq',
            question_text: 'Which CPU scheduling algorithm gives minimum average waiting time for a given set of processes?',
            explanation: 'SJF (Shortest Job First) is optimal by giving minimum average waiting time.',
            difficulty: 'medium',
            default_marks: 2,
            is_deleted: false,
            created_at: now,
            updated_at: now
        };
        const o4_1 = { id: 'c9', question_id: q4Id, option_text: 'FCFS', is_correct: false, option_order: 1 };
        const o4_2 = { id: 'c10', question_id: q4Id, option_text: 'SJF', is_correct: true, option_order: 2 };
        const o4_3 = { id: 'c11', question_id: q4Id, option_text: 'Round Robin', is_correct: false, option_order: 3 };
        const o4_4 = { id: 'c12', question_id: q4Id, option_text: 'Priority Scheduling', is_correct: false, option_order: 4 };
        this.questions.push(q1, q2, q3, q4);
        this.questionOptions.push(o1_1, o1_2, o1_3, o1_4, o2_1, o2_2, o2_3, o2_4, o4_1, o4_2, o4_3, o4_4);
        // 5. Exams
        const exam1 = {
            id: 'e1111111-1111-1111-1111-111111111111',
            created_by: facultyProfile.id,
            department_id: deptCSE.id,
            batch_id: batchCSE2024.id,
            title: 'DBMS Internal Assessment',
            subject: 'DBMS',
            description: 'Covers Relational Algebra, Normalization, and Transactions.',
            duration_minutes: 60,
            total_marks: 10,
            passing_marks: 4,
            negative_marking_rate: 0.25,
            question_selection_type: 'manual',
            start_time: pastDate,
            end_time: futureDate,
            status: 'published',
            shuffle_questions: false,
            shuffle_options: false,
            results_published: false,
            created_at: pastDate,
            updated_at: pastDate
        };
        const exam2 = {
            id: 'e2222222-2222-2222-2222-222222222222',
            created_by: facultyProfile.id,
            department_id: deptCSE.id,
            batch_id: batchCSE2024.id,
            title: 'Operating Systems Assessment',
            subject: 'Operating Systems',
            description: 'Mid-term assessment covering Process Scheduling and Memory Management.',
            duration_minutes: 90,
            total_marks: 20,
            passing_marks: 8,
            negative_marking_rate: 0.5,
            question_selection_type: 'random',
            start_time: futureDate,
            end_time: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'published',
            shuffle_questions: true,
            shuffle_options: true,
            results_published: false,
            created_at: now,
            updated_at: now
        };
        this.exams.push(exam1, exam2);
        // Exam Questions Mapping
        this.examQuestions.push({ id: 'eq1', exam_id: exam1.id, question_id: q1Id, points: 2, order_index: 1 }, { id: 'eq2', exam_id: exam1.id, question_id: q2Id, points: 2, order_index: 2 }, { id: 'eq3', exam_id: exam1.id, question_id: q3Id, points: 6, order_index: 3 }, { id: 'eq4', exam_id: exam2.id, question_id: q4Id, points: 2, order_index: 1 });
        // Exam Assignments
        this.examAssignments.push({ id: 'ea1', exam_id: exam1.id, student_id: studentProfile1.id, assigned_at: pastDate, status: 'pending' }, { id: 'ea2', exam_id: exam1.id, student_id: studentProfile2.id, assigned_at: pastDate, status: 'evaluated' }, { id: 'ea3', exam_id: exam2.id, student_id: studentProfile1.id, assigned_at: now, status: 'pending' });
        // Past Completed Submission for Ananya
        const submissionAnanya = {
            id: 'sub1',
            exam_id: exam1.id,
            student_id: studentProfile2.id,
            started_at: pastDate,
            submitted_at: pastDate,
            time_spent_seconds: 1800,
            auto_submitted: false,
            total_score: 9.0,
            is_evaluated: true,
            grade: 'A',
            feedback: 'Excellent work on descriptive concepts.',
            created_at: pastDate
        };
        this.examSubmissions.push(submissionAnanya);
        this.results.push({
            id: 'r1',
            exam_id: exam1.id,
            student_id: studentProfile2.id,
            submission_id: submissionAnanya.id,
            total_marks: 10,
            marks_obtained: 9.0,
            percentage: 90.0,
            rank: 1,
            status: 'pass',
            published_at: pastDate
        });
        // 6. Notifications
        this.notifications.push({
            id: 'n1',
            user_id: studentProfile1.id,
            title: 'Exam Scheduled',
            message: 'DBMS Internal Assessment is scheduled and active. Please start your exam.',
            type: 'exam_published',
            is_read: false,
            created_at: now
        }, {
            id: 'n2',
            user_id: studentProfile2.id,
            title: 'Results Published',
            message: 'Your result for DBMS Internal Assessment (Score: 90%) has been published.',
            type: 'result_published',
            is_read: true,
            read_at: now,
            created_at: pastDate
        });
        // 7. Audit Logs
        this.auditLogs.push({
            id: 'al1',
            user_id: adminProfile.id,
            user_email: adminProfile.email,
            action: 'SYSTEM_INIT',
            entity_type: 'SYSTEM',
            details: { info: 'System seed database loaded successfully.' },
            ip_address: '127.0.0.1',
            created_at: now
        });
    }
    logAudit(action, entity_type, entity_id, details, userId, email) {
        const log = {
            id: (0, uuid_1.v4)(),
            user_id: userId,
            user_email: email,
            action,
            entity_type,
            entity_id,
            details,
            ip_address: '127.0.0.1',
            created_at: new Date().toISOString()
        };
        this.auditLogs.unshift(log);
    }
}
exports.mockDb = new MockDatabase();
