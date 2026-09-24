import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { BatchModal } from '../../components/admin/BatchModal';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { Batch, Department } from '../../types';
import { useNotification } from '../../context/NotificationContext';

export const AdminBatches: React.FC = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);

  const { showToast } = useNotification();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bRes, dRes] = await Promise.all([api.get('/batches'), api.get('/departments')]);
      setBatches(bRes.data);
      setDepartments(dRes.data);
    } catch (err) {
      console.error('Failed to load batches', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete batch "${name}"?`)) return;
    try {
      await api.delete(`/batches/${id}`);
      showToast('success', 'Deleted', 'Batch deleted');
      fetchData();
    } catch (err: any) {
      showToast('error', 'Error', err.response?.data?.error || 'Delete error');
    }
  };

  return (
    <DashboardLayout title="Batch Management" subtitle="Student cohorts, academic years, and department assignments">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-slate-900 text-sm">All Batches</h3>
        <button
          onClick={() => {
            setEditingBatch(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all"
        >
          <Plus className="h-4 w-4" /> Add Batch
        </button>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        {loading ? (
          <p className="text-sm text-slate-400 py-8 text-center">Loading batches...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400 font-extrabold">
                  <th className="py-3 px-4">Batch Name</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Academic Duration</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {batches.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-semibold text-slate-900">{b.name}</td>
                    <td className="py-4 px-4 text-slate-600 font-medium">{b.department_name}</td>
                    <td className="py-4 px-4 text-slate-600">
                      {b.start_year} - {b.end_year}
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingBatch(b);
                          setShowModal(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(b.id, b.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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

      <BatchModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchData}
        editingBatch={editingBatch}
        departments={departments}
      />
    </DashboardLayout>
  );
};
