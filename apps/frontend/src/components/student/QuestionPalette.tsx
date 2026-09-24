import React from 'react';
import { StudentAnswerPayload } from '../../types';

interface QuestionPaletteProps {
  questions: StudentAnswerPayload[];
  currentIndex: number;
  onSelectIndex: (index: number) => void;
  onSubmitExam: () => void;
}

export const QuestionPalette: React.FC<QuestionPaletteProps> = ({
  questions,
  currentIndex,
  onSelectIndex,
  onSubmitExam
}) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
      <h3 className="font-bold text-slate-900 text-sm mb-4">Question Navigation</h3>

      {/* Number Palette Grid */}
      <div className="grid grid-cols-5 gap-2.5 mb-6">
        {questions.map((q, idx) => {
          const isCurrent = idx === currentIndex;
          const isAnswered = Boolean(q.saved_selected_option_id || q.saved_descriptive_answer);
          const isFlagged = q.is_flagged;

          let bgClass = 'bg-slate-50 text-slate-700 border-slate-200';
          if (isFlagged) {
            bgClass = 'bg-amber-100 text-amber-900 border-amber-400 font-bold';
          } else if (isAnswered) {
            bgClass = 'bg-blue-600 text-white border-blue-600 font-bold shadow-md shadow-blue-500/20';
          }

          if (isCurrent) {
            bgClass += ' ring-2 ring-offset-2 ring-blue-600';
          }

          return (
            <button
              key={q.id}
              onClick={() => onSelectIndex(idx)}
              className={`h-10 rounded-xl text-xs font-semibold border flex items-center justify-center transition-all ${bgClass}`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-blue-600"></span>
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-amber-400"></span>
          <span>Flagged for Review</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-slate-100 border border-slate-300"></span>
          <span>Unvisited / Unanswered</span>
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={onSubmitExam}
        className="mt-6 w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-rose-600/30 transition-all"
      >
        Submit Exam
      </button>
    </div>
  );
};
