import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Badge } from '../../components/common/Badge';
import { CSVImportModal } from '../../components/faculty/CSVImportModal';
import { Plus, Upload, Search, Trash2, Edit } from 'lucide-react';
import { api } from '../../services/api';
import { Question } from '../../types';
import { useNotification } from '../../context/NotificationContext';

export const FacultyQuestionBank: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCSVModal, setShowCSVModal] = useState(false);

  const { showToast } = useNotification();

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/questions', {
        params: { search, difficulty, subject }
      });
      setQuestions(res.data);
    } catch (err) {
      console.error('Failed to load question bank', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [search, difficulty, subject]);

  const handleDelete = async (id: string, text: string) => {
    if (!window.confirm(`Are you sure you want to delete question: "${text.substring(0, 40)}..."?`)) {
      return;
    }

    try {
      await api.delete(`/questions/${id}`);
      showToast('success', 'Question Deleted', 'Question has been soft-deleted.');
      fetchQuestions();
    } catch (err: any) {
      showToast('error', 'Delete Failed', err.response?.data?.error || 'Delete error');
    }
  };

  return (
    <DashboardLayout title="Question Bank Repository" subtitle="Create, filter, and maintain exam questions">
      {/* Top Controls Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions by text or topic..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="py-2.5 px-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="py-2.5 px-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Subjects</option>
            <option value="DBMS">DBMS</option>
            <option value="Operating Systems">Operating Systems</option>
            <option value="CN">CN</option>
          </select>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button
            onClick={() => setShowCSVModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
          >
            <Upload className="h-4 w-4" /> Import CSV
          </button>
          <Link
            to="/faculty/questions/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all"
          >
            <Plus className="h-4 w-4" /> Add Question
          </Link>
        </div>
      </div>

      {/* Questions Data Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        {loading ? (
          <p className="text-sm text-slate-400 py-8 text-center">Filtering questions...</p>
        ) : questions.length === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center">No questions found matching criteria.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400 font-extrabold">
                  <th className="py-3 px-4">Subject / Topic</th>
                  <th className="py-3 px-4">Question Text</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Difficulty</th>
                  <th className="py-3 px-4">Marks</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {questions.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-800">
                      <div>{q.subject}</div>
                      <div className="text-xs text-slate-400 font-normal">{q.topic || 'General'}</div>
                    </td>
                    <td className="py-4 px-4 text-slate-800 max-w-md truncate font-medium">
                      {q.question_text}
                    </td>
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
                    <td className="py-4 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleDelete(q.id, q.question_text)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Question"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CSVImportModal
        isOpen={showCSVModal}
        onClose={() => setShowCSVModal(false)}
        onSuccess={fetchQuestions}
      />
    </DashboardLayout>
  );
};
