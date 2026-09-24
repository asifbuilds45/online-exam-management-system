import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TimerHeader } from '../../components/student/TimerHeader';
import { QuestionCard } from '../../components/student/QuestionCard';
import { QuestionPalette } from '../../components/student/QuestionPalette';
import { LiveExamSession, StudentAnswerPayload } from '../../types';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { ShieldCheck, Lock } from 'lucide-react';

export const LiveExam: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<LiveExamSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [questions, setQuestions] = useState<StudentAnswerPayload[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  const navigate = useNavigate();
  const { showToast } = useNotification();

  // Tab focus / Blur detection anti-cheat listener
  useEffect(() => {
    const handleBlur = () => {
      showToast('warning', 'Security Alert', 'Leaving the exam window is recorded in audit logs.');
    };
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [showToast]);

  // Load live exam session from backend
  useEffect(() => {
    const startSession = async () => {
      try {
        const res = await api.post(`/exams/${id}/start`);
        setSession(res.data);
        setQuestions(res.data.questions || []);
      } catch (err: any) {
        if (err.response?.status === 403) {
          setIsLocked(true);
          showToast('error', 'Submission Locked', err.response?.data?.error || 'Already submitted');
        } else {
          showToast('error', 'Error', err.response?.data?.error || 'Failed to start exam');
          navigate('/student/exams');
        }
      } finally {
        setLoading(false);
      }
    };
    startSession();
  }, [id, navigate, showToast]);

  // Autosave single answer hook
  const autosave = useCallback(
    async (qId: string, optId?: string, descText?: string, isFlagged?: boolean) => {
      if (!session?.submission_id) return;
      try {
        await api.post('/submissions/autosave', {
          submission_id: session.submission_id,
          question_id: qId,
          selected_option_id: optId,
          descriptive_answer: descText,
          is_flagged: isFlagged
        });
      } catch (err) {
        console.error('Autosave error', err);
      }
    },
    [session]
  );

  const handleSelectOption = (optionId: string) => {
    const currentQ = questions[currentIndex];
    const updated = [...questions];
    updated[currentIndex] = { ...currentQ, saved_selected_option_id: optionId };
    setQuestions(updated);

    autosave(currentQ.id, optionId, currentQ.saved_descriptive_answer, currentQ.is_flagged);
  };

  const handleChangeDescriptiveText = (text: string) => {
    const currentQ = questions[currentIndex];
    const updated = [...questions];
    updated[currentIndex] = { ...currentQ, saved_descriptive_answer: text };
    setQuestions(updated);

    autosave(currentQ.id, currentQ.saved_selected_option_id, text, currentQ.is_flagged);
  };

  const handleToggleFlag = () => {
    const currentQ = questions[currentIndex];
    const updated = [...questions];
    const newFlagState = !currentQ.is_flagged;
    updated[currentIndex] = { ...currentQ, is_flagged: newFlagState };
    setQuestions(updated);

    autosave(
      currentQ.id,
      currentQ.saved_selected_option_id,
      currentQ.saved_descriptive_answer,
      newFlagState
    );
  };

  const handleSubmitExam = async (autoSubmitted = false) => {
    if (submitting || !session?.submission_id) return;

    if (!autoSubmitted) {
      const confirmSubmit = window.confirm(
        'Are you sure you want to submit your examination? Once submitted, your answers will be locked.'
      );
      if (!confirmSubmit) return;
    }

    setSubmitting(true);
    try {
      await api.post('/submissions/submit', {
        submission_id: session.submission_id,
        auto_submitted: autoSubmitted,
        time_spent_seconds: 1200
      });
      showToast(
        'success',
        autoSubmitted ? 'Time Expired - Exam Auto-Submitted' : 'Exam Submitted Successfully!',
        'Your answers have been locked.'
      );
      navigate('/student/results');
    } catch (err: any) {
      showToast('error', 'Submission Error', err.response?.data?.error || 'Submit error');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLocked) {
    return (
      <div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl border text-center max-w-md w-full">
          <Lock className="h-16 w-16 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900">Submission Locked</h2>
          <p className="text-xs text-slate-500 mt-2 mb-6">
            You have already submitted this examination session. Re-entry is restricted.
          </p>
          <button
            onClick={() => navigate('/student/results')}
            className="w-full py-3 bg-blue-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30"
          >
            Go to Results
          </button>
        </div>
      </div>
    );
  }

  if (loading || !session) {
    return (
      <div className="min-h-screen bg-[#172033] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-300">Initializing secure exam environment...</p>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex flex-col">
      {/* Dark Exam Top Header */}
      <header className="bg-[#172033] text-white px-8 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-4">
          <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center font-extrabold text-sm">
            OEMS
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight">{session.title}</h1>
            <p className="text-xs text-slate-400">{session.subject}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <ShieldCheck className="h-4 w-4" /> Anti-Cheat Active
          </div>

          <TimerHeader
            durationMinutes={session.duration_minutes}
            onTimeExpired={() => handleSubmitExam(true)}
          />
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Question Card Main View */}
        <div className="lg:col-span-3">
          {currentQ && (
            <QuestionCard
              question={currentQ}
              questionIndex={currentIndex}
              totalQuestions={questions.length}
              onSelectOption={handleSelectOption}
              onChangeDescriptiveText={handleChangeDescriptiveText}
              onToggleFlag={handleToggleFlag}
              onPrevious={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              onNext={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
            />
          )}
        </div>

        {/* Question Palette Navigation Sidebar */}
        <div>
          <QuestionPalette
            questions={questions}
            currentIndex={currentIndex}
            onSelectIndex={(idx) => setCurrentIndex(idx)}
            onSubmitExam={() => handleSubmitExam(false)}
          />
        </div>
      </main>
    </div>
  );
};
