import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { ShieldAlert, Clock, CheckCircle2, Play } from 'lucide-react';
import { api } from '../../services/api';
import { Exam } from '../../types';
import { useNotification } from '../../context/NotificationContext';

export const ExamInstructions: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [exam, setExam] = useState<Exam | null>(null);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { showToast } = useNotification();

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await api.get(`/exams/${id}`);
        setExam(res.data);
      } catch (err: any) {
        showToast('error', 'Error', err.response?.data?.error || 'Exam not found');
        navigate('/student/exams');
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [id]);

  const handleStartExam = () => {
    if (!agree) {
      showToast('warning', 'Agreement Required', 'Please accept the rules before starting.');
      return;
    }
    navigate(`/student/exams/${id}`);
  };

  if (loading || !exam) {
    return (
      <DashboardLayout title="Exam Instructions">
        <p className="text-sm text-slate-400 py-8 text-center">Loading exam parameters...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={`Instructions: ${exam.title}`} subtitle={exam.subject}>
      <div className="max-w-3xl bg-white border border-slate-200/80 rounded-2xl p-8 shadow-sm space-y-6">
        {/* Important Alert banner */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-900">
          <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold">Proctored Online Examination Rules</p>
            <p>Do not refresh or leave the window. Any tab switching will be flagged to faculty.</p>
          </div>
        </div>

        {/* Exam Parameter Summary */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase block">Duration</span>
            <strong className="text-lg font-bold text-slate-900">{exam.duration_minutes} Minutes</strong>
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase block">Total Marks</span>
            <strong className="text-lg font-bold text-slate-900">{exam.total_marks} Marks</strong>
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase block">Negative Marking</span>
            <strong className="text-lg font-bold text-slate-900">
              {exam.negative_marking_rate > 0 ? `${exam.negative_marking_rate * 100}%` : 'None'}
            </strong>
          </div>
        </div>

        {/* Detailed Guidelines */}
        <div className="space-y-3">
          <h4 className="font-bold text-sm text-slate-900">Candidate Guidelines:</h4>
          <ul className="space-y-2 text-xs text-slate-600 list-disc pl-5 leading-relaxed">
            <li>Ensure you have a stable internet connection for auto-saving responses.</li>
            <li>Your answers are automatically saved immediately upon selecting an option.</li>
            <li>You can flag questions for later review using the flag button.</li>
            <li>The test will auto-submit when the countdown timer reaches zero.</li>
            <li>Once submitted, your session is locked and re-entry is prohibited.</li>
          </ul>
        </div>

        {/* Agreement Checkbox */}
        <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="text-xs font-semibold text-slate-700">
            I have read and agree to all examination rules and instructions.
          </span>
        </label>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            onClick={handleStartExam}
            disabled={!agree}
            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Play className="h-4 w-4 fill-white" /> Start Examination
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};
