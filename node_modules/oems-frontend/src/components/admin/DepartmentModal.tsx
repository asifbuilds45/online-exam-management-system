import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Department } from '../../types';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingDept?: Department | null;
}

export const DepartmentModal: React.FC<DepartmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingDept
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useNotification();

  useEffect(() => {
    if (editingDept) {
      setName(editingDept.name);
      setCode(editingDept.code);
    } else {
      setName('');
      setCode('');
    }
  }, [editingDept, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingDept) {
        await api.put(`/departments/${editingDept.id}`, { name, code });
        showToast('success', 'Department Updated', 'Department saved successfully.');
      } else {
        await api.post('/departments', { name, code });
        showToast('success', 'Department Created', 'New department created successfully.');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast('error', 'Save Failed', err.response?.data?.error || 'Department save error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingDept ? 'Edit Department' : 'Add Department'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Department Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Computer Science & Engineering"
            className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Department Code
          </label>
          <input
            type="text"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. CSE"
            className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none uppercase"
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
            className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
          >
            {loading ? 'Saving...' : editingDept ? 'Update Department' : 'Create Department'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
