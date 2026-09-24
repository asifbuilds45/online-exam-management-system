import { Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { mockDb, StudentAnswer } from '../services/mockDb.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export async function autosaveAnswer(req: AuthRequest, res: Response) {
  const schema = z.object({
    submission_id: z.string().uuid(),
    question_id: z.string().uuid(),
    selected_option_id: z.string().optional(),
    descriptive_answer: z.string().optional(),
    is_flagged: z.boolean().optional()
  });

  const body = schema.parse(req.body);

  const submission = mockDb.examSubmissions.find((s) => s.id === body.submission_id);
  if (!submission) {
    return res.status(404).json({ error: 'Exam submission session not found' });
  }

  // Submission Lock Guard
  if (submission.submitted_at) {
    return res.status(403).json({ error: 'Exam submission is locked. Answers cannot be updated.' });
  }

  let answer = mockDb.studentAnswers.find(
    (a) => a.submission_id === body.submission_id && a.question_id === body.question_id
  );

  const now = new Date().toISOString();

  if (!answer) {
    answer = {
      id: uuidv4(),
      submission_id: body.submission_id,
      question_id: body.question_id,
      selected_option_id: body.selected_option_id,
      descriptive_answer: body.descriptive_answer,
      is_flagged: body.is_flagged || false,
      marks_awarded: 0,
      saved_at: now
    };
    mockDb.studentAnswers.push(answer);
  } else {
    if (body.selected_option_id !== undefined) answer.selected_option_id = body.selected_option_id;
    if (body.descriptive_answer !== undefined) answer.descriptive_answer = body.descriptive_answer;
    if (body.is_flagged !== undefined) answer.is_flagged = body.is_flagged;
    answer.saved_at = now;
  }

  return res.json({ message: 'Answer autosaved', answer });
}

export async function submitExam(req: AuthRequest, res: Response) {
  const schema = z.object({
    submission_id: z.string().uuid(),
    auto_submitted: z.boolean().optional().default(false),
    time_spent_seconds: z.number().optional().default(0)
  });

  const { submission_id, auto_submitted, time_spent_seconds } = schema.parse(req.body);

  const submission = mockDb.examSubmissions.find((s) => s.id === submission_id);
  if (!submission) {
    return res.status(404).json({ error: 'Exam submission session not found' });
  }

  if (submission.submitted_at) {
    return res.status(400).json({ error: 'Exam has already been submitted.' });
  }

  const exam = mockDb.exams.find((e) => e.id === submission.exam_id);
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

  const examQuestions = mockDb.examQuestions.filter((eq) => eq.exam_id === exam.id);

  for (const eq of examQuestions) {
    const question = mockDb.questions.find((q) => q.id === eq.question_id);
    if (!question) continue;

    const studentAnswer = mockDb.studentAnswers.find(
      (a) => a.submission_id === submission.id && a.question_id === question.id
    );

    if (question.question_type === 'mcq') {
      if (studentAnswer && studentAnswer.selected_option_id) {
        const correctOption = mockDb.questionOptions.find(
          (o) => o.question_id === question.id && o.is_correct
        );

        if (correctOption && studentAnswer.selected_option_id === correctOption.id) {
          // Correct answer
          const marks = eq.points || question.default_marks;
          studentAnswer.marks_awarded = marks;
          totalScore += marks;
        } else {
          // Wrong answer -> Apply negative marking if configured
          const penalty = (eq.points || question.default_marks) * exam.negative_marking_rate;
          studentAnswer.marks_awarded = -penalty;
          totalScore -= penalty;
        }
      } else {
        // Unanswered
        if (studentAnswer) studentAnswer.marks_awarded = 0;
      }
    } else if (question.question_type === 'descriptive') {
      hasDescriptiveQuestions = true;
    }
  }

  // Ensure total score is non-negative
  submission.total_score = Math.max(0, parseFloat(totalScore.toFixed(2)));
  submission.is_evaluated = !hasDescriptiveQuestions; // If no descriptive questions, fully evaluated automatically!

  // Update assignment status
  const assignment = mockDb.examAssignments.find(
    (a) => a.exam_id === exam.id && a.student_id === submission.student_id
  );
  if (assignment) {
    assignment.status = submission.is_evaluated ? 'evaluated' : 'submitted';
  }

  mockDb.logAudit(
    'SUBMIT_EXAM',
    'EXAM_SUBMISSION',
    submission.id,
    { score: submission.total_score, auto_submitted },
    req.user?.id,
    req.user?.email
  );

  return res.json({
    message: 'Exam submitted successfully and locked.',
    submission,
    total_score: submission.total_score,
    is_evaluated: submission.is_evaluated
  });
}

export async function getSubmissionsForExam(req: AuthRequest, res: Response) {
  const { examId } = req.params;
  const submissions = mockDb.examSubmissions.filter((s) => s.exam_id === examId);

  const enriched = submissions.map((sub) => {
    const student = mockDb.profiles.find((p) => p.id === sub.student_id);
    const answers = mockDb.studentAnswers.filter((a) => a.submission_id === sub.id);
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

export async function gradeDescriptiveSubmission(req: AuthRequest, res: Response) {
  const { submissionId } = req.params;
  const schema = z.object({
    feedback: z.string().optional(),
    grades: z.array(
      z.object({
        question_id: z.string().uuid(),
        marks_awarded: z.number().nonnegative(),
        evaluation_feedback: z.string().optional()
      })
    )
  });

  const { feedback, grades } = schema.parse(req.body);

  const submission = mockDb.examSubmissions.find((s) => s.id === submissionId);
  if (!submission) {
    return res.status(404).json({ error: 'Submission not found' });
  }

  let totalScored = submission.total_score;

  for (const item of grades) {
    let answer = mockDb.studentAnswers.find(
      (a) => a.submission_id === submission.id && a.question_id === item.question_id
    );
    if (answer) {
      totalScored += item.marks_awarded;
      answer.marks_awarded = item.marks_awarded;
      answer.evaluation_feedback = item.evaluation_feedback;
    }
  }

  submission.total_score = Math.max(0, parseFloat(totalScored.toFixed(2)));
  submission.is_evaluated = true;
  if (feedback) submission.feedback = feedback;

  // Update assignment status
  const assignment = mockDb.examAssignments.find(
    (a) => a.exam_id === submission.exam_id && a.student_id === submission.student_id
  );
  if (assignment) {
    assignment.status = 'evaluated';
  }

  mockDb.logAudit(
    'GRADE_DESCRIPTIVE',
    'EXAM_SUBMISSION',
    submissionId,
    { score: submission.total_score },
    req.user?.id,
    req.user?.email
  );

  return res.json({ message: 'Submission evaluated and graded successfully', submission });
}
