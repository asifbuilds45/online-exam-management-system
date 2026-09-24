import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Badge } from '../../components/common/Badge';
import { api } from '../../services/api';
import { Question } from '../../types';

export const AdminQuestions: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await api.get('/questions');
        setQuestions(res.data);
      } catch (err) {
        console.error('Failed to load questions', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

  return (
    <DashboardLayout title="System Question Repository" subtitle="Global question monitoring for administrators">
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        {loading ? (
          <p className="text-sm text-slate-400 py-8 text-center">Loading questions...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400 font-extrabold">
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Question Text</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Difficulty</th>
                  <th className="py-3 px-4">Marks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {questions.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-800">{q.subject}</td>
                    <td className="py-4 px-4 text-slate-800 max-w-lg truncate">{q.question_text}</td>
                    <td className="py-4 px-4">
                      <Badge variant={q.question_type === 'mcq' ? 'blue' : 'purple'}>
                        {q.question_type.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <Badge
                        variant={
                          q.difficulty === 'easy'
                            ? 'green'
                            : q.difficulty === 'medium'
                            ? 'yellow'
                            : 'red'
                        }
                      >
                        {q.difficulty}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-900">{q.default_marks} pts</td>
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
