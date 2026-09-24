import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Badge } from '../../components/common/Badge';
import { Trophy, Award, CheckCircle, Eye } from 'lucide-react';
import { api } from '../../services/api';
import { Result } from '../../types';

export const StudentResults: React.FC = () => {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await api.get('/results');
        setResults(res.data.results || []);
      } catch (err) {
        console.error('Failed to load student results', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  const latestResult = results[0];

  return (
    <DashboardLayout title="Exam Results" subtitle="Performance breakdown & publish scorecard">
      {/* Featured Hero Metric Card */}
      {latestResult && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-8 mb-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
              Latest Published Scorecard
            </span>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-2">
              {latestResult.exam_title}
            </h3>
            <p className="text-xs text-slate-400 mt-1">{latestResult.exam_subject}</p>
          </div>

          <div className="flex items-center gap-8">
            <div className="text-center">
              <span className="text-xs font-bold text-slate-400 uppercase block">Score</span>
              <strong className="text-3xl font-black text-slate-900">
                {latestResult.marks_obtained} / {latestResult.total_marks}
              </strong>
            </div>

            <div className="text-center">
              <span className="text-xs font-bold text-slate-400 uppercase block">Percentage</span>
              <strong className="text-3xl font-black text-blue-600">
                {latestResult.percentage}%
              </strong>
            </div>

            <div className="text-center">
              <span className="text-xs font-bold text-slate-400 uppercase block">Rank</span>
              <strong className="text-3xl font-black text-amber-500">
                #{latestResult.rank || '1'}
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* Results History Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-900 text-sm mb-4">Published Scorecards</h3>

        {loading ? (
          <p className="text-sm text-slate-400 py-8 text-center">Loading scorecards...</p>
        ) : results.length === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center">No published results available yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400 font-extrabold">
                  <th className="py-3 px-4">Exam Title</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Marks Obtained</th>
                  <th className="py-3 px-4">Percentage</th>
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {results.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-semibold text-slate-900">{r.exam_title}</td>
                    <td className="py-4 px-4 text-slate-600">{r.exam_subject}</td>
                    <td className="py-4 px-4 font-bold text-slate-900">
                      {r.marks_obtained} / {r.total_marks}
                    </td>
                    <td className="py-4 px-4 font-semibold text-blue-600">{r.percentage}%</td>
                    <td className="py-4 px-4 font-bold text-amber-600">#{r.rank}</td>
                    <td className="py-4 px-4">
                      <Badge variant={r.status === 'pass' ? 'green' : 'red'}>
                        {r.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        to={`/student/results/${r.exam_id}`}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 font-bold text-xs rounded-lg hover:bg-blue-100 transition-all inline-flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" /> Detailed Review
                      </Link>
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
