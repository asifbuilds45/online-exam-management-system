import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { ArrowLeft, Save, CheckSquare } from 'lucide-react';
import { api } from '../../services/api';
import { Question, Batch } from '../../types';
import { useNotification } from '../../context/NotificationContext';

export const FacultyCreateExam: React.FC = () => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('DBMS');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [totalMarks, setTotalMarks] = useState<number>(10);
  const [passingMarks, setPassingMarks] = useState<number>(4);
  const [negativeRate, setNegativeRate] = useState<number>(0.25);
  const [selectionType, setSelectionType] = useState<'manual' | 'random'>('manual');
  const [batchId, setBatchId] = useState('');
  const [startTime, setStartTime] = useState(new Date().toISOString().slice(0, 16));
  const [endTime, setEndTime] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );

  // Manual Question Checklist State
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [selectedQIds, setSelectedQIds] = useState<string[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useNotification();

  useEffect(() => {
    const loadResources = async () => {
      try {
        const [qRes, bRes] = await Promise.all([api.get('/questions'), api.get('/batches')]);
        setAvailableQuestions(qRes.data);
        setBatches(bRes.data);
        if (bRes.data.length > 0) setBatchId(bRes.data[0].id);

        // Pre-select first 3 questions as default checklist
        if (qRes.data.length > 0) {
          setSelectedQIds(qRes.data.slice(0, 3).map((q: Question) => q.id));
        }
      } catch (err) {
        console.error('Resource load error', err);
      }
    };
    loadResources();
  }, []);

  const handleToggleQuestion = (qId: string) => {
    setSelectedQIds((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/exams', {
        title,
        subject,
        description,
        duration_minutes: Number(durationMinutes),
        total_marks: Number(totalMarks),
        passing_marks: Number(passingMarks),
        negative_marking_rate: Number(negativeRate),
        question_selection_type: selectionType,
        batch_id: batchId || undefined,
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
        question_ids: selectionType === 'manual' ? selectedQIds : undefined,
        random_rules:
          selectionType === 'random' ? { count: 5, difficulty: 'medium' } : undefined
      });

      showToast('success', 'Exam Created', 'Exam configuration saved successfully!');
      navigate('/faculty/exams');
    } catch (err: any) {
      showToast('error', 'Save Failed', err.response?.data?.error || 'Create exam error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Create & Schedule Exam" subtitle="Configure duration, negative marking, and questions">
      <Link
        to="/faculty/exams"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Exams
      </Link>

      <div className="max-w-4xl bg-white border border-slate-200/80 rounded-2xl p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Exam Title
              </label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. DBMS Internal Assessment"
                className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                min={5}
                required
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Total Marks
              </label>
              <input
                type="number"
                min={1}
                required
                value={totalMarks}
                onChange={(e) => setTotalMarks(Number(e.target.value))}
                className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Negative Marking Rate
              </label>
              <select
                value={negativeRate}
                onChange={(e) => setNegativeRate(Number(e.target.value))}
                className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value={0}>None (0%)</option>
                <option value={0.25}>0.25 per wrong answer (25%)</option>
                <option value={0.5}>0.50 per wrong answer (50%)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Target Batch
              </label>
              <select
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Question Selection Method
              </label>
              <select
                value={selectionType}
                onChange={(e) => setSelectionType(e.target.value as any)}
                className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="manual">Manual Question Checklist</option>
                <option value="random">Automatic Random Selection</option>
              </select>
            </div>
          </div>

          {/* Question Checklist */}
          {selectionType === 'manual' && (
            <div className="space-y-3 p-6 bg-slate-50 border border-slate-200 rounded-2xl">
              <h4 className="font-bold text-xs uppercase text-slate-500 tracking-wider flex items-center gap-2">
                <CheckSquare className="h-4 w-4" /> Select Questions for Exam:
              </h4>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                {availableQuestions.map((q) => {
                  const isChecked = selectedQIds.includes(q.id);
                  return (
                    <label
                      key={q.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-blue-50 border-blue-300 text-blue-900 font-semibold'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleQuestion(q.id)}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-xs truncate flex-1">{q.question_text}</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-600">
                        {q.default_marks} pts
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Link
              to="/faculty/exams"
              className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
            >
              <Save className="h-4 w-4" /> {loading ? 'Saving...' : 'Save & Publish Exam'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};
