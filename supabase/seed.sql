-- OEMS Seed Data for College Demo

-- Departments
INSERT INTO departments (id, name, code) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Computer Science & Engineering', 'CSE'),
  ('22222222-2222-2222-2222-222222222222', 'Electronics & Communication Engineering', 'ECE'),
  ('33333333-3333-3333-3333-333333333333', 'Information Technology', 'IT')
ON CONFLICT (id) DO NOTHING;

-- Batches
INSERT INTO batches (id, department_id, name, start_year, end_year) VALUES
  ('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'CSE 2023-2027', 2023, 2027),
  ('a2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'CSE 2024-2028', 2024, 2028),
  ('a3333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'ECE 2024-2028', 2024, 2028)
ON CONFLICT (id) DO NOTHING;

-- Profiles (Admin, Faculty, Students)
-- Note: UUIDs correspond to seeded auth user IDs in demo mode
INSERT INTO profiles (id, full_name, email, role, department_id, batch_id, registration_number, status) VALUES
  ('00000000-0000-0000-0000-000000000001', 'System Administrator', 'admin@college.edu', 'admin', '11111111-1111-1111-1111-111111111111', NULL, 'ADM001', 'active'),
  ('00000000-0000-0000-0000-000000000002', 'Dr. Priya Sharma', 'faculty@college.edu', 'faculty', '11111111-1111-1111-1111-111111111111', NULL, 'FAC001', 'active'),
  ('00000000-0000-0000-0000-000000000003', 'Arun Kumar', 'student@college.edu', 'student', '11111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222', '24CSE001', 'active'),
  ('00000000-0000-0000-0000-000000000004', 'Ananya Roy', 'ananya@college.edu', 'student', '11111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222', '24CSE002', 'active')
ON CONFLICT (id) DO NOTHING;

-- Questions & Options
INSERT INTO questions (id, created_by, subject, topic, question_type, question_text, explanation, difficulty, default_marks) VALUES
  ('b1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000002', 'DBMS', 'Relational Algebra', 'mcq', 'What is the primary purpose of a primary key in a database table?', 'A primary key uniquely identifies each record/tuple in a relation.', 'easy', 2.00),
  ('b2222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000002', 'DBMS', 'Normalization', 'mcq', 'Which normal form eliminates partial dependency on candidate keys?', 'Second Normal Form (2NF) requires 1NF and no partial key dependencies.', 'medium', 2.00),
  ('b3333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000002', 'DBMS', 'Transactions', 'descriptive', 'Explain the ACID properties of database transactions with real-world banking examples.', 'Atomicity, Consistency, Isolation, Durability.', 'hard', 5.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO question_options (id, question_id, option_text, is_correct, option_order) VALUES
  ('c1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'To uniquely identify each record in a table', TRUE, 1),
  ('c2222222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111', 'To allow duplicate values across rows', FALSE, 2),
  ('c3333333-3333-3333-3333-333333333333', 'b1111111-1111-1111-1111-111111111111', 'To encrypt database data at rest', FALSE, 3),
  ('c4444444-4444-4444-4444-444444444444', 'b1111111-1111-1111-1111-111111111111', 'To automatically compress large text columns', FALSE, 4),
  ('c5555555-5555-5555-5555-555555555555', 'b2222222-2222-2222-2222-222222222222', '1NF', FALSE, 1),
  ('c6666666-6666-6666-6666-666666666666', 'b2222222-2222-2222-2222-222222222222', '2NF', TRUE, 2),
  ('c7777777-7777-7777-7777-777777777777', 'b2222222-2222-2222-2222-222222222222', '3NF', FALSE, 3),
  ('c8888888-8888-8888-8888-888888888888', 'b2222222-2222-2222-2222-222222222222', 'BCNF', FALSE, 4)
ON CONFLICT (id) DO NOTHING;
