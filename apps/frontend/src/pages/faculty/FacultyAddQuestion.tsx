import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

export const FacultyAddQuestion: React.FC = () => {
  const [subject, setSubject] = useState('DBMS');
  const [topic, setTopic] = useState('SQL');
  const [questionType, setQuestionType] = useState<'mcq' | 'descriptive'>('mcq');
  const [questionText, setQuestionText] = useState('');
  const [explanation, setExplanation] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [marks, setMarks] = useState<number>(2);

  // MCQ Options State
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctOpt, setCorrectOpt] = useState<'A' | 'B' | 'C' | 'D'>('A');

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const optionsPayload =
      questionType === 'mcq'
        ? [
            { option_text: optA, is_correct: correctOpt === 'A' },
            { option_text: optB, is_correct: correctOpt === 'B' },
            { option_text: optC, is_correct: correctOpt === 'C' },
            { option_text: optD, is_correct: correctOpt === 'D' }
          ]
        : undefined;

    try {
      await api.post('/questions', {
        subject,
        topic,
        question_type: questionType,
        question_text: questionText,
        explanation,
        difficulty,
        default_marks: Number(marks),
        options: optionsPayload
      });

      showToast('success', 'Question Saved', 'Question added to bank successfully!');
      navigate('/faculty/questions');
    } catch (err: any) {
      showToast('error', 'Save Failed', err.response?.data?.error || 'Failed to save question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Create New Question" subtitle="Add MCQs or descriptive questions to repository">
      <Link
        to="/faculty/questions"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Question Bank
      </Link>

      <div className="max-w-3xl bg-white border border-slate-200/80 rounded-2xl p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Question Type Toggle */}
          <div className="flex gap-4 p-1 bg-slate-100 rounded-2xl max-w-xs text-xs font-bold">
            <button
              type="button"
              onClick={() => setQuestionType('mcq')}
              className={`flex-1 py-2.5 rounded-xl transition-all ${
                questionType === 'mcq' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              Multiple Choice (MCQ)
            </button>
            <button
              type="button"
              onClick={() => setQuestionType('descriptive')}
              className={`flex-1 py-2.5 rounded-xl transition-all ${
                questionType === 'descriptive' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              Descriptive / Essay
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Question Statement
            </label>
            <textarea
              required
              rows={3}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Enter question prompt..."
              className="w-full p-4 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* MCQ Options Form Inputs */}
          {questionType === 'mcq' && (
            <div className="space-y-4 p-6 bg-slate-50 border border-slate-200 rounded-2xl">
              <h4 className="font-bold text-xs uppercase text-slate-500 tracking-wider">
                Answer Options
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Option A</label>
                  <input
                    required
                    value={optA}
                    onChange={(e) => setOptA(e.target.value)}
                    placeholder="Choice A text"
                    className="w-full p-3 border border-slate-300 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Option B</label>
                  <input
                    required
                    value={optB}
                    onChange={(e) => setOptB(e.target.value)}
                    placeholder="Choice B text"
                    className="w-full p-3 border border-slate-300 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Option C</label>
                  <input
                    required
                    value={optC}
                    onChange={(e) => setOptC(e.target.value)}
                    placeholder="Choice C text"
                    className="w-full p-3 border border-slate-300 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Option D</label>
                  <input
                    required
                    value={optD}
                    onChange={(e) => setOptD(e.target.value)}
                    placeholder="Choice D text"
                    className="w-full p-3 border border-slate-300 rounded-xl text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Select Correct Choice
                </label>
                <select
                  value={correctOpt}
                  onChange={(e) => setCorrectOpt(e.target.value as any)}
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="A">Option A</option>
                  <option value="B">Option B</option>
                  <option value="C">Option C</option>
                  <option value="D">Option D</option>
                </select>
              </div>
            </div>
          )}

          {/* Classification Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Subject
              </label>
              <input
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. DBMS"
                className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Topic
              </label>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Relational Algebra"
                className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Default Marks
            </label>
            <input
              type="number"
              min={1}
              required
              value={marks}
              onChange={(e) => setMarks(Number(e.target.value))}
              className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none max-w-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Solution / Explanation
            </label>
            <textarea
              rows={2}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Explanation shown to students after results published..."
              className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Link
              to="/faculty/questions"
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
            >
              <Save className="h-4 w-4" /> {loading ? 'Saving...' : 'Save Question'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};
