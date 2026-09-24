import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { BookOpen, Calendar, Users, FilePlus, CheckCircle } from 'lucide-react';
import { api } from '../../services/api';
import { Exam } from '../../types';

export const FacultyDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>({
    my_questions: 128,
    active_exams: 6,
    completed_exams: 14,
    total_students: 240
  });
  const [upcomingExams, setUpcomingExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, examsRes] = await Promise.all([
          api.get('/stats/faculty'),
          api.get('/exams')
        ]);
        setStats(statsRes.data);
        setUpcomingExams(examsRes.data);
      } catch (err) {
        console.error('Failed to load faculty stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <DashboardLayout title="Faculty Dashboard" subtitle="Manage question banks and examination workflows">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Questions" value={stats.my_questions} icon={BookOpen} color="bg-blue-500" />
        <StatCard title="Active Exams" value={stats.active_exams} icon={Calendar} color="bg-emerald-500" />
        <StatCard title="Completed Exams" value={stats.completed_exams} icon={CheckCircle} color="bg-amber-500" />
        <StatCard title="Enrolled Students" value={stats.total_students} icon={Users} color="bg-purple-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions Panel */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 text-base mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              to="/faculty/questions/new"
              className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 text-blue-600 font-semibold text-sm transition-all"
            >
              <FilePlus className="h-5 w-5" /> ＋ Add New Question
            </Link>
            <Link
              to="/faculty/exams/new"
              className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 text-blue-600 font-semibold text-sm transition-all"
            >
              <Calendar className="h-5 w-5" /> ＋ Create & Schedule Exam
            </Link>
            <Link
              to="/faculty/questions"
              className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 text-blue-600 font-semibold text-sm transition-all"
            >
              <BookOpen className="h-5 w-5" /> 📚 Question Bank Repository
            </Link>
          </div>
        </div>

        {/* Scheduled Exams List */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base">Scheduled Examinations</h3>
            <Link to="/faculty/exams" className="text-xs font-bold text-blue-600 hover:underline">
              View All →
            </Link>
          </div>

          {loading ? (
            <p className="text-sm text-slate-400 py-6 text-center">Loading exams...</p>
          ) : upcomingExams.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">No exams scheduled.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400 font-extrabold">
                    <th className="py-3 px-4">Exam Title</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {upcomingExams.slice(0, 5).map((exam) => (
                    <tr key={exam.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">{exam.title}</td>
                      <td className="py-3.5 px-4 text-slate-600">{exam.subject}</td>
                      <td className="py-3.5 px-4">
                        <Badge variant={exam.status === 'published' ? 'blue' : 'gray'}>
                          {exam.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
