import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Badge } from '../../components/common/Badge';
import { api } from '../../services/api';
import { Exam } from '../../types';

export const AdminExams: React.FC = () => {
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
    <DashboardLayout title="System Exam Monitoring" subtitle="View all college examinations and publish states">
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        {loading ? (
          <p className="text-sm text-slate-400 py-8 text-center">Loading exam logs...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400 font-extrabold">
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Total Marks</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Results State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {exams.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-semibold text-slate-900">{e.title}</td>
                    <td className="py-4 px-4 text-slate-600">{e.subject}</td>
                    <td className="py-4 px-4 text-slate-600">{e.duration_minutes} min</td>
                    <td className="py-4 px-4 font-bold text-slate-800">{e.total_marks} pts</td>
                    <td className="py-4 px-4">
                      <Badge variant={e.status === 'published' ? 'blue' : 'gray'}>
                        {e.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant={e.results_published ? 'green' : 'yellow'}>
                        {e.results_published ? 'Published' : 'Pending'}
                      </Badge>
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
