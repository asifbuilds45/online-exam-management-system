import { v4 as uuidv4 } from 'uuid';

export interface Department {
  id: string;
  name: string;
  code: string;
  created_at: string;
}

export interface Batch {
  id: string;
  department_id: string;
  name: string;
  start_year: number;
  end_year: number;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: 'student' | 'faculty' | 'admin';
  department_id?: string;
  batch_id?: string;
  registration_number?: string;
  avatar_url?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface QuestionOption {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
  option_order: number;
}

export interface Question {
  id: string;
  created_by: string;
  subject: string;
  topic?: string;
  question_type: 'mcq' | 'descriptive';
  question_text: string;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  default_marks: number;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  options?: QuestionOption[];
}

export interface ExamQuestion {
  id: string;
  exam_id: string;
  question_id: string;
  points: number;
  order_index: number;
}

export interface Exam {
  id: string;
  created_by: string;
  department_id?: string;
  batch_id?: string;
  title: string;
  subject: string;
  description?: string;
  duration_minutes: number;
  total_marks: number;
  passing_marks: number;
  negative_marking_rate: number;
  question_selection_type: 'manual' | 'random';
  start_time: string;
  end_time: string;
  status: 'draft' | 'published' | 'ongoing' | 'completed' | 'archived';
  shuffle_questions: boolean;
  shuffle_options: boolean;
  results_published: boolean;
  created_at: string;
  updated_at: string;
  questions?: Question[];
}

export interface ExamAssignment {
  id: string;
  exam_id: string;
  student_id: string;
  assigned_at: string;
  status: 'pending' | 'in_progress' | 'submitted' | 'evaluated';
}

export interface StudentAnswer {
  id: string;
  submission_id: string;
  question_id: string;
  selected_option_id?: string;
  descriptive_answer?: string;
  is_flagged: boolean;
  marks_awarded: number;
  evaluation_feedback?: string;
  saved_at: string;
}

export interface ExamSubmission {
  id: string;
  exam_id: string;
  student_id: string;
  started_at: string;
  submitted_at?: string;
  time_spent_seconds: number;
  auto_submitted: boolean;
  total_score: number;
  is_evaluated: boolean;
  grade?: string;
  feedback?: string;
  created_at: string;
  answers?: StudentAnswer[];
}

export interface Result {
  id: string;
  exam_id: string;
  student_id: string;
  submission_id: string;
  total_marks: number;
  marks_obtained: number;
  percentage: number;
  rank?: number;
  status: 'pass' | 'fail';
  published_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'exam_published' | 'reminder' | 'result_published' | 'system';
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export interface AuditLogItem {
  id: string;
  user_id?: string;
  user_email?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: any;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

class MockDatabase {
  departments: Department[] = [];
  batches: Batch[] = [];
  profiles: Profile[] = [];
  questions: Question[] = [];
  questionOptions: QuestionOption[] = [];
  exams: Exam[] = [];
  examQuestions: ExamQuestion[] = [];
  examAssignments: ExamAssignment[] = [];
  examSubmissions: ExamSubmission[] = [];
  studentAnswers: StudentAnswer[] = [];
  results: Result[] = [];
  notifications: NotificationItem[] = [];
  auditLogs: AuditLogItem[] = [];

  constructor() {
    this.seed();
  }

  private seed() {
    const now = new Date().toISOString();
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const pastDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();

    // 1. Departments
    const deptCSE: Department = {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Computer Science & Engineering',
      code: 'CSE',
      created_at: now
    };
    const deptECE: Department = {
      id: '22222222-2222-2222-2222-222222222222',
      name: 'Electronics & Communication',
      code: 'ECE',
      created_at: now
    };
    this.departments.push(deptCSE, deptECE);

    // 2. Batches
    const batchCSE2024: Batch = {
      id: 'a1111111-1111-1111-1111-111111111111',
      department_id: deptCSE.id,
      name: 'CSE 2024-2028',
      start_year: 2024,
      end_year: 2028,
      created_at: now
    };
    const batchCSE2023: Batch = {
      id: 'a2222222-2222-2222-2222-222222222222',
      department_id: deptCSE.id,
      name: 'CSE 2023-2027',
      start_year: 2023,
      end_year: 2027,
      created_at: now
    };
    this.batches.push(batchCSE2024, batchCSE2023);

    // 3. Profiles
    const adminProfile: Profile = {
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
    const facultyProfile: Profile = {
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
    const studentProfile1: Profile = {
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
    const studentProfile2: Profile = {
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
    const q1: Question = {
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
    const o1_1: QuestionOption = { id: 'c1', question_id: q1Id, option_text: 'To uniquely identify each record', is_correct: true, option_order: 1 };
    const o1_2: QuestionOption = { id: 'c2', question_id: q1Id, option_text: 'To store duplicate rows', is_correct: false, option_order: 2 };
    const o1_3: QuestionOption = { id: 'c3', question_id: q1Id, option_text: 'To encrypt table columns', is_correct: false, option_order: 3 };
    const o1_4: QuestionOption = { id: 'c4', question_id: q1Id, option_text: 'To create database backups', is_correct: false, option_order: 4 };

    const q2Id = 'b2222222-2222-2222-2222-222222222222';
    const q2: Question = {
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
    const o2_1: QuestionOption = { id: 'c5', question_id: q2Id, option_text: '1NF', is_correct: false, option_order: 1 };
    const o2_2: QuestionOption = { id: 'c6', question_id: q2Id, option_text: '2NF', is_correct: true, option_order: 2 };
    const o2_3: QuestionOption = { id: 'c7', question_id: q2Id, option_text: '3NF', is_correct: false, option_order: 3 };
    const o2_4: QuestionOption = { id: 'c8', question_id: q2Id, option_text: 'BCNF', is_correct: false, option_order: 4 };

    const q3Id = 'b3333333-3333-3333-3333-333333333333';
    const q3: Question = {
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
    const q4: Question = {
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
    const o4_1: QuestionOption = { id: 'c9', question_id: q4Id, option_text: 'FCFS', is_correct: false, option_order: 1 };
    const o4_2: QuestionOption = { id: 'c10', question_id: q4Id, option_text: 'SJF', is_correct: true, option_order: 2 };
    const o4_3: QuestionOption = { id: 'c11', question_id: q4Id, option_text: 'Round Robin', is_correct: false, option_order: 3 };
    const o4_4: QuestionOption = { id: 'c12', question_id: q4Id, option_text: 'Priority Scheduling', is_correct: false, option_order: 4 };

    this.questions.push(q1, q2, q3, q4);
    this.questionOptions.push(o1_1, o1_2, o1_3, o1_4, o2_1, o2_2, o2_3, o2_4, o4_1, o4_2, o4_3, o4_4);

    // 5. Exams
    const exam1: Exam = {
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

    const exam2: Exam = {
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
    this.examQuestions.push(
      { id: 'eq1', exam_id: exam1.id, question_id: q1Id, points: 2, order_index: 1 },
      { id: 'eq2', exam_id: exam1.id, question_id: q2Id, points: 2, order_index: 2 },
      { id: 'eq3', exam_id: exam1.id, question_id: q3Id, points: 6, order_index: 3 },
      { id: 'eq4', exam_id: exam2.id, question_id: q4Id, points: 2, order_index: 1 }
    );

    // Exam Assignments
    this.examAssignments.push(
      { id: 'ea1', exam_id: exam1.id, student_id: studentProfile1.id, assigned_at: pastDate, status: 'pending' },
      { id: 'ea2', exam_id: exam1.id, student_id: studentProfile2.id, assigned_at: pastDate, status: 'evaluated' },
      { id: 'ea3', exam_id: exam2.id, student_id: studentProfile1.id, assigned_at: now, status: 'pending' }
    );

    // Past Completed Submission for Ananya
    const submissionAnanya: ExamSubmission = {
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
    this.notifications.push(
      {
        id: 'n1',
        user_id: studentProfile1.id,
        title: 'Exam Scheduled',
        message: 'DBMS Internal Assessment is scheduled and active. Please start your exam.',
        type: 'exam_published',
        is_read: false,
        created_at: now
      },
      {
        id: 'n2',
        user_id: studentProfile2.id,
        title: 'Results Published',
        message: 'Your result for DBMS Internal Assessment (Score: 90%) has been published.',
        type: 'result_published',
        is_read: true,
        read_at: now,
        created_at: pastDate
      }
    );

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

  logAudit(action: string, entity_type: string, entity_id?: string, details?: any, userId?: string, email?: string) {
    const log: AuditLogItem = {
      id: uuidv4(),
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

export const mockDb = new MockDatabase();
