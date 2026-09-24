import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Award, Download, Send, CheckCircle, Trophy, BarChart3 } from 'lucide-react';
import { api } from '../../services/api';
import { Exam, Result } from '../../types';
import { useNotification } from '../../context/NotificationContext';

export const FacultyResults: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [results, setResults] = useState<Result[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Grade Modal State
  const [gradingSubmission, setGradingSubmission] = useState<any | null>(null);
  const [descriptiveMark, setDescriptiveMark] = useState<number>(5);
  const [feedback, setFeedback] = useState<string>('');

  const { showToast } = useNotification();

  const fetchExams = async () => {
    try {
      const res = await api.get('/exams');
      setExams(res.data);
      if (res.data.length > 0 && !selectedExamId) {
        setSelectedExamId(res.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load exams', err);
    }
  };

  const fetchResults = async (examId: string) => {
    if (!examId) return;
    setLoading(true);
    try {
      const [resResult, resSubs] = await Promise.all([
        api.get('/results', { params: { exam_id: examId } }),
        api.get(`/submissions/exam/${examId}`)
      ]);
      setResults(resResult.data.results || []);
      setStatistics(resResult.data.statistics);
      setSubmissions(resSubs.data || []);
    } catch (err) {
      console.error('Failed to load results', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    if (selectedExamId) {
      fetchResults(selectedExamId);
    }
  }, [selectedExamId]);

  const handlePublishResults = async () => {
    if (!selectedExamId) return;
    try {
      const res = await api.post(`/results/publish/${selectedExamId}`);
      showToast('success', 'Results Published', res.data.message);
      fetchResults(selectedExamId);
    } catch (err: any) {
      showToast('error', 'Publish Error', err.response?.data?.error || 'Publish error');
    }
  };

  const handleDownloadCSV = () => {
    if (!selectedExamId) return;
    window.open(`/api/results/export-csv/${selectedExamId}`, '_blank');
  };

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission) return;

    try {
      await api.post(`/submissions/grade/${gradingSubmission.id}`, {
        feedback,
        grades: [
          {
            question_id: 'b3333333-3333-3333-3333-333333333333',
            marks_awarded: Number(descriptiveMark),
            evaluation_feedback: feedback
          }
        ]
      });

      showToast('success', 'Grading Saved', 'Descriptive response score updated.');
      setGradingSubmission(null);
      fetchResults(selectedExamId);
    } catch (err: any) {
      showToast('error', 'Grading Error', err.response?.data?.error || 'Grade save error');
    }
  };

  return (
    <DashboardLayout title="Results & Evaluation" subtitle="Grade descriptive answers, publish scorecards, and export CSV">
      {/* Exam Selector Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="text-xs font-bold text-slate-500 uppercase">Select Exam:</label>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="py-2.5 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {exams.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title} ({e.subject})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
          >
            <Download className="h-4 w-4" /> Export Results CSV
          </button>
          <button
            onClick={handlePublishResults}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all"
          >
            <Send className="h-4 w-4" /> Calculate & Publish Results
          </button>
        </div>
      </div>

      {/* Telemetry Statistics Grid */}
      {statistics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Class Average" value={`${statistics.average_score_percentage}%`} icon={Award} color="bg-blue-500" />
          <StatCard title="Highest Score" value={statistics.highest_score} icon={Trophy} color="bg-emerald-500" />
          <StatCard title="Lowest Score" value={statistics.lowest_score} icon={BarChart3} color="bg-amber-500" />
          <StatCard title="Pass Rate" value={`${statistics.pass_percentage}%`} icon={CheckCircle} color="bg-purple-500" />
        </div>
      )}

      {/* Submissions & Results Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 text-sm mb-4">Student Exam Submissions</h3>

        {loading ? (
          <p className="text-sm text-slate-400 py-8 text-center">Loading submissions...</p>
        ) : submissions.length === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center">No student submissions recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400 font-extrabold">
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Reg Number</th>
                  <th className="py-3 px-4">Submitted At</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Evaluated</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-semibold text-slate-900">{sub.student_name}</td>
                    <td className="py-4 px-4 text-slate-600">{sub.registration_number}</td>
                    <td className="py-4 px-4 text-slate-600">
                      {sub.submitted_at ? new Date(sub.submitted_at).toLocaleString() : 'In Progress'}
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-900">{sub.total_score} pts</td>
                    <td className="py-4 px-4">
                      <Badge variant={sub.is_evaluated ? 'green' : 'yellow'}>
                        {sub.is_evaluated ? 'Evaluated' : 'Pending Grading'}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => {
                          setGradingSubmission(sub);
                          setDescriptiveMark(5);
                          setFeedback(sub.feedback || '');
                        }}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 font-bold text-xs rounded-lg hover:bg-blue-100 transition-all"
                      >
                        Grade Descriptive
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Grade Modal */}
      <Modal
        isOpen={Boolean(gradingSubmission)}
        onClose={() => setGradingSubmission(null)}
        title={`Grade Submission: ${gradingSubmission?.student_name}`}
      >
        <form onSubmit={handleGradeSubmit} className="space-y-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-xs font-bold uppercase text-slate-400 block mb-1">
              Descriptive Question Response
            </span>
            <p className="text-xs text-slate-800 leading-relaxed font-mono">
              "Atomicity guarantees all or nothing. Consistency ensures valid state transitions. Isolation isolates concurrent transactions using locking. Durability persists committed logs."
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Marks Awarded (Max 6)
            </label>
            <input
              type="number"
              min={0}
              max={6}
              required
              value={descriptiveMark}
              onChange={(e) => setDescriptiveMark(Number(e.target.value))}
              className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Faculty Feedback
            </label>
            <textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Great explanation of ACID properties..."
              className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setGradingSubmission(null)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/30 transition-all"
            >
              Save Grade
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};
