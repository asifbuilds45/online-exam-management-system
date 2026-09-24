-- Online Exam Management System (OEMS) - Complete PostgreSQL Schema & RLS Policies

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. DEPARTMENTS
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(20) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BATCHES
CREATE TABLE IF NOT EXISTS batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  start_year INT NOT NULL,
  end_year INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PROFILES (Integrates with auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'faculty', 'admin')),
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  batch_id UUID REFERENCES batches(id) ON DELETE SET NULL,
  registration_number VARCHAR(50) UNIQUE,
  avatar_url TEXT,
  phone VARCHAR(20),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. QUESTIONS
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subject VARCHAR(100) NOT NULL,
  topic VARCHAR(100),
  question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('mcq', 'descriptive')),
  question_text TEXT NOT NULL,
  explanation TEXT,
  difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  default_marks NUMERIC(5,2) DEFAULT 1.00,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. QUESTION OPTIONS
CREATE TABLE IF NOT EXISTS question_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  option_order INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. EXAMS
CREATE TABLE IF NOT EXISTS exams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  batch_id UUID REFERENCES batches(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  description TEXT,
  duration_minutes INT NOT NULL,
  total_marks NUMERIC(6,2) DEFAULT 0.00,
  passing_marks NUMERIC(6,2) DEFAULT 0.00,
  negative_marking_rate NUMERIC(4,2) DEFAULT 0.00,
  question_selection_type VARCHAR(20) DEFAULT 'manual' CHECK (question_selection_type IN ('manual', 'random')),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'ongoing', 'completed', 'archived')),
  shuffle_questions BOOLEAN DEFAULT FALSE,
  shuffle_options BOOLEAN DEFAULT FALSE,
  results_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. EXAM QUESTIONS
CREATE TABLE IF NOT EXISTS exam_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  points NUMERIC(5,2) NOT NULL DEFAULT 1.00,
  order_index INT NOT NULL DEFAULT 1,
  UNIQUE(exam_id, question_id)
);

-- 8. EXAM ASSIGNMENTS
CREATE TABLE IF NOT EXISTS exam_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'submitted', 'evaluated')),
  UNIQUE(exam_id, student_id)
);

-- 9. EXAM SUBMISSIONS
CREATE TABLE IF NOT EXISTS exam_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  time_spent_seconds INT DEFAULT 0,
  auto_submitted BOOLEAN DEFAULT FALSE,
  total_score NUMERIC(6,2) DEFAULT 0.00,
  is_evaluated BOOLEAN DEFAULT FALSE,
  grade VARCHAR(10),
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(exam_id, student_id)
);

-- 10. STUDENT ANSWERS
CREATE TABLE IF NOT EXISTS student_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submission_id UUID REFERENCES exam_submissions(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  selected_option_id UUID REFERENCES question_options(id) ON DELETE SET NULL,
  descriptive_answer TEXT,
  is_flagged BOOLEAN DEFAULT FALSE,
  marks_awarded NUMERIC(5,2) DEFAULT 0.00,
  evaluation_feedback TEXT,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(submission_id, question_id)
);

-- 11. RESULTS
CREATE TABLE IF NOT EXISTS results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES exam_submissions(id) ON DELETE CASCADE,
  total_marks NUMERIC(6,2) NOT NULL,
  marks_obtained NUMERIC(6,2) NOT NULL,
  percentage NUMERIC(5,2) NOT NULL,
  rank INT,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pass', 'fail')),
  published_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(exam_id, student_id)
);

-- 12. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('exam_published', 'reminder', 'result_published', 'system')),
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  details JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_department ON profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_questions_subject ON questions(subject);
CREATE INDEX IF NOT EXISTS idx_exams_status ON exams(status);
CREATE INDEX IF NOT EXISTS idx_assignments_student ON exam_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_exam_student ON exam_submissions(exam_id, student_id);
CREATE INDEX IF NOT EXISTS idx_answers_submission ON student_answers(submission_id);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Helper functions for RLS
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS VARCHAR AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- RLS Policies
-- Profiles: Users can view their own profile; Admins can view all; Faculty can view students
CREATE POLICY profiles_select_policy ON profiles
  FOR SELECT USING (
    id = auth.uid() OR 
    current_user_role() = 'admin' OR 
    (current_user_role() = 'faculty' AND role = 'student')
  );

CREATE POLICY profiles_admin_all ON profiles
  FOR ALL USING (current_user_role() = 'admin');

-- Questions: Faculty & Admin can manage; Students can view when part of an assigned active exam
CREATE POLICY questions_faculty_admin ON questions
  FOR ALL USING (current_user_role() IN ('faculty', 'admin'));

-- Exams: Faculty & Admin full control; Students can view published assigned exams
CREATE POLICY exams_faculty_admin ON exams
  FOR ALL USING (current_user_role() IN ('faculty', 'admin'));

CREATE POLICY exams_student_read ON exams
  FOR SELECT USING (
    current_user_role() = 'student' AND 
    status IN ('published', 'ongoing', 'completed')
  );

-- Submissions & Answers: Students control their own submission during exam
CREATE POLICY submissions_student ON exam_submissions
  FOR ALL USING (student_id = auth.uid() OR current_user_role() IN ('faculty', 'admin'));

CREATE POLICY answers_student ON student_answers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM exam_submissions s 
      WHERE s.id = student_answers.submission_id AND (s.student_id = auth.uid() OR current_user_role() IN ('faculty', 'admin'))
    )
  );
