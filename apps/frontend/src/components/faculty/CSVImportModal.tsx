import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Upload, FileText } from 'lucide-react';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CSVImportModal: React.FC<CSVImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [csvText, setCsvText] = useState<string>(
    `Subject,Topic,Type,QuestionText,Difficulty,Marks,OptA,OptB,OptC,OptD,CorrectOpt
DBMS,Relational Algebra,mcq,What is a primary key?,easy,2,Unique record ID,Duplicate row,Encrypted value,Table backup,A
OS,Process Scheduling,mcq,Which algorithm gives minimum average waiting time?,medium,2,FCFS,SJF,Round Robin,Priority,B
CN,Protocols,descriptive,Explain the TCP three-way handshake process.,hard,5,,,,,`
  );
  const [loading, setLoading] = useState(false);
  const { showToast } = useNotification();

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/questions/import-csv', { csvText });
      showToast('success', 'Import Successful', res.data.message);
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast('error', 'Import Failed', err.response?.data?.error || 'CSV import error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Import Questions via CSV" maxWidth="max-w-2xl">
      <form onSubmit={handleImport} className="space-y-4">
        <p className="text-xs text-slate-500">
          Paste comma-separated question records matching the standard template below:
        </p>

        <div className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-xs overflow-x-auto">
          Subject,Topic,Type,QuestionText,Difficulty,Marks,OptA,OptB,OptC,OptD,CorrectOpt
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            CSV Data
          </label>
          <textarea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            rows={10}
            required
            className="w-full p-4 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
          >
            <Upload className="h-4 w-4" /> {loading ? 'Importing...' : 'Import Questions'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
