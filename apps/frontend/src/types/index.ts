export type UserRole = 'student' | 'faculty' | 'admin';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  department_id?: string;
  batch_id?: string;
  department?: string;
  batch?: string;
  registration_number?: string;
  avatar_url?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  created_at: string;
}

export interface Batch {
  id: string;
  department_id: string;
  department_name?: string;
  name: string;
  start_year: number;
  end_year: number;
  created_at: string;
}

export interface QuestionOption {
  id: string;
  question_id?: string;
  option_text: string;
  is_correct?: boolean;
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
  is_deleted?: boolean;
  options?: QuestionOption[];
  created_at?: string;
}

export interface Exam {
  id: string;
  created_by: string;
  department_id?: string;
  batch_id?: string;
  department_name?: string;
  batch_name?: string;
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
  question_count?: number;
  assigned_student_count?: number;
  user_submission_status?: 'pending' | 'in_progress' | 'submitted';
  questions?: Question[];
}

export interface ExamSubmission {
  id: string;
  exam_id: string;
  student_id: string;
  student_name?: string;
  student_email?: string;
  registration_number?: string;
  started_at: string;
  submitted_at?: string;
  time_spent_seconds: number;
  auto_submitted: boolean;
  total_score: number;
  is_evaluated: boolean;
  grade?: string;
  feedback?: string;
}

export interface StudentAnswerPayload {
  id: string;
  question_text: string;
  question_type: 'mcq' | 'descriptive';
  subject: string;
  topic?: string;
  difficulty: string;
  points: number;
  options: QuestionOption[];
  saved_selected_option_id?: string;
  saved_descriptive_answer?: string;
  is_flagged: boolean;
}

export interface LiveExamSession {
  submission_id: string;
  started_at: string;
  duration_minutes: number;
  title: string;
  subject: string;
  questions: StudentAnswerPayload[];
}

export interface Result {
  id: string;
  exam_id: string;
  exam_title?: string;
  exam_subject?: string;
  student_id: string;
  student_name?: string;
  student_email?: string;
  registration_number?: string;
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
  created_at: string;
}
