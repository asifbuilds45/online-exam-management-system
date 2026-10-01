import { Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { mockDb, Question, QuestionOption } from '../services/mockDb.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export async function getQuestions(req: AuthRequest, res: Response) {
  const { subject, difficulty, question_type, search } = req.query;

  let list = mockDb.questions.filter((q) => !q.is_deleted);

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
    list = list.filter(
      (q) =>
        q.question_text.toLowerCase().includes(qStr) ||
        (q.topic && q.topic.toLowerCase().includes(qStr)) ||
        q.subject.toLowerCase().includes(qStr)
    );
  }

  const enriched = list.map((q) => {
    const options = mockDb.questionOptions.filter((o) => o.question_id === q.id);
    return {
      ...q,
      options
    };
  });

  return res.json(enriched);
}

export async function getQuestionById(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const question = mockDb.questions.find((q) => q.id === id && !q.is_deleted);
  if (!question) {
    return res.status(404).json({ error: 'Question not found' });
  }

  const options = mockDb.questionOptions.filter((o) => o.question_id === question.id);
  return res.json({ ...question, options });
}

export async function createQuestion(req: AuthRequest, res: Response) {
  const schema = z.object({
    subject: z.string().min(1),
    topic: z.string().optional(),
    question_type: z.enum(['mcq', 'descriptive']),
    question_text: z.string().min(3),
    explanation: z.string().optional(),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    default_marks: z.number().positive(),
    options: z
      .array(
        z.object({
          option_text: z.string().min(1),
          is_correct: z.boolean()
        })
      )
      .optional()
  });

  const body = schema.parse(req.body);

  const questionId = uuidv4();
  const now = new Date().toISOString();

  const newQuestion: Question = {
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

  mockDb.questions.unshift(newQuestion);

  const createdOptions: QuestionOption[] = [];
  if (body.question_type === 'mcq' && body.options && body.options.length > 0) {
    body.options.forEach((opt, idx) => {
      const optionObj: QuestionOption = {
        id: uuidv4(),
        question_id: questionId,
        option_text: opt.option_text,
        is_correct: opt.is_correct,
        option_order: idx + 1
      };
      mockDb.questionOptions.push(optionObj);
      createdOptions.push(optionObj);
    });
  }

  mockDb.logAudit('CREATE_QUESTION', 'QUESTION', questionId, { subject: body.subject, type: body.question_type }, req.user?.id, req.user?.email);

  return res.status(201).json({
    ...newQuestion,
    options: createdOptions
  });
}

export async function updateQuestion(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const question = mockDb.questions.find((q) => q.id === id && !q.is_deleted);
  if (!question) {
    return res.status(404).json({ error: 'Question not found' });
  }

  const schema = z.object({
    subject: z.string().optional(),
    topic: z.string().optional(),
    question_text: z.string().optional(),
    explanation: z.string().optional(),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
    default_marks: z.number().positive().optional(),
    options: z
      .array(
        z.object({
          option_text: z.string(),
          is_correct: z.boolean()
        })
      )
      .optional()
  });

  const body = schema.parse(req.body);

  Object.assign(question, body, { updated_at: new Date().toISOString() });

  if (body.options && question.question_type === 'mcq') {
    // Replace options
    mockDb.questionOptions = mockDb.questionOptions.filter((o) => o.question_id !== id);
    body.options.forEach((opt, idx) => {
      mockDb.questionOptions.push({
        id: uuidv4(),
        question_id: id,
        option_text: opt.option_text,
        is_correct: opt.is_correct,
        option_order: idx + 1
      });
    });
  }

  mockDb.logAudit('UPDATE_QUESTION', 'QUESTION', id, body, req.user?.id, req.user?.email);

  const updatedOptions = mockDb.questionOptions.filter((o) => o.question_id === id);
  return res.json({ ...question, options: updatedOptions });
}

export async function deleteQuestion(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const question = mockDb.questions.find((q) => q.id === id);
  if (!question) {
    return res.status(404).json({ error: 'Question not found' });
  }

  // Soft delete flag
  question.is_deleted = true;
  question.updated_at = new Date().toISOString();

  mockDb.logAudit('DELETE_QUESTION', 'QUESTION', id, { question_text: question.question_text }, req.user?.id, req.user?.email);

  return res.json({ message: 'Question soft deleted successfully' });
}

export async function importCSV(req: AuthRequest, res: Response) {
  const { csvText } = z.object({ csvText: z.string().min(5) }).parse(req.body);

  const lines = csvText.split('\n').filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    return res.status(400).json({ error: 'CSV text must contain header and at least 1 data row' });
  }

  let importedCount = 0;
  const validationErrors: string[] = [];
  const now = new Date().toISOString();

  // CSV parser: Subject,Topic,Type,QuestionText,Difficulty,Marks,OptA,OptB,OptC,OptD,CorrectOpt
  for (let i = 1; i < lines.length; i++) {
    const lineNumber = i + 1;
    const cols = lines[i].split(',').map((c) => c.trim().replace(/^"(.*)"$/, '$1'));

    if (cols.length < 4) {
      validationErrors.push(`Line ${lineNumber}: Insufficient columns. Minimum required: Subject, Topic, Type, QuestionText.`);
      continue;
    }

    const [subject, topic, type, text, difficulty, marks, optA, optB, optC, optD, correctOpt] = cols;

    if (!text || text.length < 3) {
      validationErrors.push(`Line ${lineNumber}: Question text must be at least 3 characters.`);
      continue;
    }

    const cleanType = (type || 'mcq').toLowerCase();
    if (cleanType !== 'mcq' && cleanType !== 'descriptive') {
      validationErrors.push(`Line ${lineNumber}: Invalid question type '${type}'. Must be 'mcq' or 'descriptive'.`);
      continue;
    }

    const cleanDiff = (difficulty || 'medium').toLowerCase();
    if (!['easy', 'medium', 'hard'].includes(cleanDiff)) {
      validationErrors.push(`Line ${lineNumber}: Invalid difficulty '${difficulty}'. Must be 'easy', 'medium', or 'hard'.`);
      continue;
    }

    const parsedMarks = parseFloat(marks);
    if (marks && (isNaN(parsedMarks) || parsedMarks <= 0)) {
      validationErrors.push(`Line ${lineNumber}: Invalid marks '${marks}'. Must be a positive number.`);
      continue;
    }

    if (cleanType === 'mcq' && (!optA || !optB)) {
      validationErrors.push(`Line ${lineNumber}: MCQ questions require at least Option A and Option B.`);
      continue;
    }

    const qId = uuidv4();
    const questionObj: Question = {
      id: qId,
      created_by: req.user?.id || 'system',
      subject: subject || 'General',
      topic: topic || 'General',
      question_type: cleanType as any,
      question_text: text,
      difficulty: cleanDiff as any,
      default_marks: parsedMarks || 2,
      is_deleted: false,
      created_at: now,
      updated_at: now
    };

    mockDb.questions.unshift(questionObj);

    if (cleanType === 'mcq' && optA && optB) {
      const optionsList = [optA, optB, optC, optD].filter(Boolean);
      const correctLetter = (correctOpt || 'A').toUpperCase();

      optionsList.forEach((optText, idx) => {
        const letter = String.fromCharCode(65 + idx);
        mockDb.questionOptions.push({
          id: uuidv4(),
          question_id: qId,
          option_text: optText,
          is_correct: letter === correctLetter,
          option_order: idx + 1
        });
      });
    }

    importedCount++;
  }

  if (importedCount === 0 && validationErrors.length > 0) {
    return res.status(400).json({
      error: 'CSV validation failed. No valid rows were imported.',
      validationErrors
    });
  }

  mockDb.logAudit('IMPORT_QUESTIONS_CSV', 'QUESTION', undefined, { count: importedCount, errorsCount: validationErrors.length }, req.user?.id, req.user?.email);

  return res.json({
    message: `Successfully imported ${importedCount} questions.${validationErrors.length > 0 ? ` Encountered ${validationErrors.length} bad row(s).` : ''}`,
    count: importedCount,
    validationErrors: validationErrors.length > 0 ? validationErrors : undefined
  });
}
