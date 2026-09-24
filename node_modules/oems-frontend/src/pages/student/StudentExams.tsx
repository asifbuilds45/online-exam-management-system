import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Badge } from '../../components/common/Badge';
import { Play, Calendar } from 'lucide-react';
import { api } from '../../services/api';
import { Exam } from '../../types';

export const StudentExams: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await api.get('/exams');
        setExams(res.data);
      } catch (err) {
        console.error('Failed to load exams', err);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  return (
    <DashboardLayout title="My Examinations" subtitle="All assigned and completed test sessions">
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        {loading ? (
          <p className="text-sm text-slate-400 py-8 text-center">Loading exams...</p>
        ) : exams.length === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center">No exams assigned at this time.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400 font-extrabold">
                  <th className="py-3 px-4">Exam Title</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Total Marks</th>
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
                    <td className="py-4 px-4 text-slate-600">{exam.total_marks} marks</td>
                    <td className="py-4 px-4">
                      <Badge
                        variant={
                          exam.user_submission_status === 'submitted'
                            ? 'green'
                            : exam.status === 'published'
                            ? 'blue'
                            : 'gray'
                        }
                      >
                        {exam.user_submission_status === 'submitted' ? 'Submitted' : exam.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {exam.user_submission_status === 'submitted' ? (
                        <Link
                          to="/student/results"
                          className="px-3 py-1.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-lg hover:bg-slate-200 transition-all inline-block"
                        >
                          View Result
                        </Link>
                      ) : (
                        <Link
                          to={`/student/exams/${exam.id}/instructions`}
                          className="px-3.5 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-lg shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-all inline-flex items-center gap-1"
                        >
                          <Play className="h-3 w-3 fill-white" /> View Instructions
                        </Link>
                      )}
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
