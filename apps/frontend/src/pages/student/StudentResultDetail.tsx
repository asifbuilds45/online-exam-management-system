import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Badge } from '../../components/common/Badge';
import { ArrowLeft, CheckCircle2, XCircle, Info } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const StudentResultDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/results/exam/${id}/student/${user?.id}`);
        setData(res.data);
      } catch (err) {
        console.error('Failed to load result detail', err);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchDetail();
  }, [id, user]);

  if (loading || !data) {
    return (
      <DashboardLayout title="Detailed Exam Review">
        <p className="text-sm text-slate-400 py-8 text-center">Loading score review data...</p>
      </DashboardLayout>
    );
  }

  const { result, exam, answerReview } = data;

  return (
    <DashboardLayout title={`Result Review: ${exam?.title}`} subtitle={exam?.subject}>
      <Link
        to="/student/results"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Results List
      </Link>

      {/* Summary Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-xl text-slate-900">{exam?.title}</h3>
          <p className="text-xs text-slate-500 mt-1">Submitted Score Review</p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase block">Obtained Score</span>
            <strong className="text-2xl font-black text-slate-900">
              {result.marks_obtained} / {result.total_marks}
            </strong>
          </div>

          <div className="text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase block">Percentage</span>
            <strong className="text-2xl font-black text-blue-600">{result.percentage}%</strong>
          </div>

          <div className="text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase block">Status</span>
            <Badge variant={result.status === 'pass' ? 'green' : 'red'}>
              {result.status.toUpperCase()}
            </Badge>
          </div>
        </div>
      </div>

      {/* Question-by-Question Review List */}
      <div className="space-y-6">
        {answerReview.map((item: any, idx: number) => {
          const isCorrect = item.marks_awarded > 0;

          return (
            <div
              key={item.question_id || idx}
              className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">
                  Question {idx + 1}
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">
                    Marks: {item.marks_awarded} / {item.points}
                  </span>
                  {item.question_type === 'mcq' && (
                    isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Correct
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
                        <XCircle className="h-3.5 w-3.5" /> Incorrect
                      </span>
                    )
                  )}
                </div>
              </div>

              <h4 className="font-bold text-slate-900 text-base mb-4">{item.question_text}</h4>

              {/* Options Review */}
              {item.question_type === 'mcq' ? (
                <div className="space-y-2 mb-4">
                  {item.options.map((opt: any) => {
                    const isSelected = item.selected_option_id === opt.id;
                    const isCorrectOpt = opt.is_correct;

                    let style = 'border-slate-200 bg-white text-slate-700';
                    if (isCorrectOpt) {
                      style = 'border-emerald-300 bg-emerald-50/70 text-emerald-900 font-semibold';
                    } else if (isSelected && !isCorrectOpt) {
                      style = 'border-rose-300 bg-rose-50/70 text-rose-900 font-semibold';
                    }

                    return (
                      <div
                        key={opt.id}
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between ${style}`}
                      >
                        <span>{opt.option_text}</span>
                        {isCorrectOpt && (
                          <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                            Correct Answer
                          </span>
                        )}
                        {isSelected && !isCorrectOpt && (
                          <span className="text-[10px] uppercase font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                            Your Selection
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-4">
                  <span className="text-xs font-bold text-slate-500 uppercase block mb-1">
                    Your Response:
                  </span>
                  <p className="text-xs text-slate-800 leading-relaxed">
                    {item.descriptive_answer || 'No answer submitted.'}
                  </p>
                </div>
              )}

              {/* Faculty Feedback / Explanation */}
              {item.explanation && (
                <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl text-xs text-blue-900 flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Explanation: </span>
                    {item.explanation}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
};
