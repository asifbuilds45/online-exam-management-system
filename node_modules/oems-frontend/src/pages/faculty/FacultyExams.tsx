import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Badge } from '../../components/common/Badge';
import { Plus, Send, CheckCircle } from 'lucide-react';
import { api } from '../../services/api';
import { Exam } from '../../types';
import { useNotification } from '../../context/NotificationContext';

export const FacultyExams: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useNotification();

  const fetchExams = async () => {
    try {
      const res = await api.get('/exams');
      setExams(res.data);
    } catch (err) {
      console.error('Failed to load faculty exams', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleTogglePublish = async (id: string, currentStatus: string) => {
    try {
      const res = await api.post(`/exams/${id}/publish`);
      showToast('success', 'Status Updated', res.data.message);
      fetchExams();
    } catch (err: any) {
      showToast('error', 'Update Failed', err.response?.data?.error || 'Publish error');
    }
  };

  return (
    <DashboardLayout title="Scheduled Examinations" subtitle="Manage exam lifecycle, publish status, and assignments">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-slate-900 text-sm">All Examinations</h3>
        <Link
          to="/faculty/exams/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all"
        >
          <Plus className="h-4 w-4" /> Create Exam
        </Link>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        {loading ? (
          <p className="text-sm text-slate-400 py-8 text-center">Loading exams...</p>
        ) : exams.length === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center">No exams created yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400 font-extrabold">
                  <th className="py-3 px-4">Exam Title</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Questions</th>
                  <th className="py-3 px-4">Assigned Students</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {exams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-semibold text-slate-900">{exam.title}</td>
                    <td className="py-4 px-4 text-slate-600">{exam.subject}</td>
                    <td className="py-4 px-4 text-slate-600">{exam.duration_minutes} min</td>
                    <td className="py-4 px-4 font-bold text-slate-800">{exam.question_count || 0} Qs</td>
                    <td className="py-4 px-4 font-bold text-slate-800">{exam.assigned_student_count || 0}</td>
                    <td className="py-4 px-4">
                      <Badge variant={exam.status === 'published' ? 'blue' : 'gray'}>
                        {exam.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleTogglePublish(exam.id, exam.status)}
                        className={`px-3 py-1.5 font-bold text-xs rounded-lg transition-all ${
                          exam.status === 'published'
                            ? 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20'
                        }`}
                      >
                        {exam.status === 'published' ? 'Unpublish' : 'Publish & Notify'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
