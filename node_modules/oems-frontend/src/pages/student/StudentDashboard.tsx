import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { Calendar, Award, CheckCircle, Trophy, Play } from 'lucide-react';
import { api } from '../../services/api';
import { Exam } from '../../types';

export const StudentDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>({
    upcoming_exams: 3,
    completed_exams: 8,
    average_score_percentage: 82.0,
    class_rank: 12
  });
  const [upcomingExams, setUpcomingExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, examsRes] = await Promise.all([
          api.get('/stats/student'),
          api.get('/exams')
        ]);
        setStats(statsRes.data);
        setUpcomingExams(examsRes.data);
      } catch (err) {
        console.error('Error loading student dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <DashboardLayout title="Student Dashboard" subtitle="Welcome back, Student">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Upcoming Exams"
          value={stats.upcoming_exams}
          icon={Calendar}
          color="bg-blue-500"
        />
        <StatCard
          title="Completed"
          value={stats.completed_exams}
          icon={CheckCircle}
          color="bg-emerald-500"
        />
        <StatCard
          title="Average Score"
          value={`${stats.average_score_percentage}%`}
          icon={Award}
          color="bg-amber-500"
        />
        <StatCard
          title="Class Rank"
          value={`#${stats.class_rank}`}
          icon={Trophy}
          color="bg-purple-500"
        />
      </div>

      {/* Upcoming Exams Panel */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-slate-900 text-base">Upcoming & Active Examinations</h3>
          <Link
            to="/student/exams"
            className="text-xs font-bold text-blue-600 hover:underline"
          >
            View All Exams →
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-slate-400 py-6 text-center">Loading examination schedule...</p>
        ) : upcomingExams.length === 0 ? (
          <p className="text-sm text-slate-400 py-6 text-center">No upcoming examinations assigned.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400 font-extrabold">
                  <th className="py-3 px-4">Exam Title</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {upcomingExams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-semibold text-slate-900">{exam.title}</td>
                    <td className="py-4 px-4 text-slate-600">{exam.subject}</td>
                    <td className="py-4 px-4 text-slate-600">{exam.duration_minutes} min</td>
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
                          to={`/student/results`}
                          className="px-3 py-1.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-lg hover:bg-slate-200 transition-all inline-block"
                        >
                          View Result
                        </Link>
                      ) : (
                        <Link
                          to={`/student/exams/${exam.id}/instructions`}
                          className="px-3.5 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-lg shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-all inline-flex items-center gap-1"
                        >
                          <Play className="h-3 w-3 fill-white" /> View Exam
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
