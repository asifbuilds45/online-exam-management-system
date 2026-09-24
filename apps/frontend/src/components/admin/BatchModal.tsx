import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Batch, Department } from '../../types';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

interface BatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingBatch?: Batch | null;
  departments: Department[];
}

export const BatchModal: React.FC<BatchModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingBatch,
  departments
}) => {
  const [departmentId, setDepartmentId] = useState('');
  const [name, setName] = useState('');
  const [startYear, setStartYear] = useState<number>(2024);
  const [endYear, setEndYear] = useState<number>(2028);
  const [loading, setLoading] = useState(false);
  const { showToast } = useNotification();

  useEffect(() => {
    if (editingBatch) {
      setDepartmentId(editingBatch.department_id);
      setName(editingBatch.name);
      setStartYear(editingBatch.start_year);
      setEndYear(editingBatch.end_year);
    } else {
      setDepartmentId(departments[0]?.id || '');
      setName('CSE 2024-2028');
      setStartYear(2024);
      setEndYear(2028);
    }
  }, [editingBatch, isOpen, departments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingBatch) {
        await api.put(`/batches/${editingBatch.id}`, {
          department_id: departmentId,
          name,
          start_year: Number(startYear),
          end_year: Number(endYear)
        });
        showToast('success', 'Batch Updated', 'Batch record saved successfully.');
      } else {
        await api.post('/batches', {
          department_id: departmentId,
          name,
          start_year: Number(startYear),
          end_year: Number(endYear)
        });
        showToast('success', 'Batch Created', 'New batch record created successfully.');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast('error', 'Save Failed', err.response?.data?.error || 'Batch save error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editingBatch ? 'Edit Batch' : 'Add Batch'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Department
          </label>
          <select
            required
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Select Department</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Batch Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. CSE 2024-2028"
            className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Start Year
            </label>
            <input
              type="number"
              required
              value={startYear}
              onChange={(e) => setStartYear(Number(e.target.value))}
              className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              End Year
            </label>
            <input
              type="number"
              required
              value={endYear}
              onChange={(e) => setEndYear(Number(e.target.value))}
              className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
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
            {loading ? 'Saving...' : editingBatch ? 'Update Batch' : 'Create Batch'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
