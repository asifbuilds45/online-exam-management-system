import React from 'react';
import { StudentAnswerPayload } from '../../types';
import { Bookmark, ChevronLeft, ChevronRight, Save } from 'lucide-react';

interface QuestionCardProps {
  question: StudentAnswerPayload;
  questionIndex: number;
  totalQuestions: number;
  onSelectOption: (optionId: string) => void;
  onChangeDescriptiveText: (text: string) => void;
  onToggleFlag: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionIndex,
  totalQuestions,
  onSelectOption,
  onChangeDescriptiveText,
  onToggleFlag,
  onPrevious,
  onNext
}) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-8 shadow-sm">
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
            Question {questionIndex + 1} of {totalQuestions}
          </span>
          <span className="text-xs font-semibold text-slate-400">
            {question.points} {question.points === 1 ? 'mark' : 'marks'}
          </span>
        </div>

        <button
          onClick={onToggleFlag}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            question.is_flagged
              ? 'bg-amber-100 text-amber-900 border border-amber-300'
              : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
          }`}
        >
          <Bookmark className={`h-4 w-4 ${question.is_flagged ? 'fill-amber-500' : ''}`} />
          {question.is_flagged ? 'Flagged' : 'Flag Question'}
        </button>
      </div>

      {/* Question Text */}
      <h3 className="text-lg font-bold text-slate-900 mb-6 leading-relaxed">
        {question.question_text}
      </h3>

      {/* Input / Options Body */}
      {question.question_type === 'mcq' ? (
        <div className="space-y-3 mb-8">
          {question.options.map((opt, i) => {
            const letter = String.fromCharCode(65 + i);
            const isSelected = question.saved_selected_option_id === opt.id;

            return (
              <label
                key={opt.id}
                onClick={() => onSelectOption(opt.id)}
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-50/80 border-blue-600 text-blue-900 font-semibold shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  checked={isSelected}
                  onChange={() => onSelectOption(opt.id)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span className="font-bold text-sm text-slate-400 w-5 shrink-0">{letter}.</span>
                <span className="text-sm">{opt.option_text}</span>
              </label>
            );
          })}
        </div>
      ) : (
        <div className="mb-8">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Write your answer below:
          </label>
          <textarea
            value={question.saved_descriptive_answer || ''}
            onChange={(e) => onChangeDescriptiveText(e.target.value)}
            placeholder="Type your descriptive response here..."
            rows={8}
            className="w-full p-4 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
        </div>
      )}

      {/* Footer Nav Controls */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-6">
        <button
          onClick={onPrevious}
          disabled={questionIndex === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="h-4 w-4" /> Previous
        </button>

        <button
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all"
        >
          Save & Next <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
