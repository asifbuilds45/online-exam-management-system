import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { DepartmentModal } from '../../components/admin/DepartmentModal';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { Department } from '../../types';
import { useNotification } from '../../context/NotificationContext';

export const AdminDepartments: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  const { showToast } = useNotification();

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/departments');
      setDepartments(res.data);
    } catch (err) {
      console.error('Failed to load departments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete department "${name}"?`)) return;
    try {
      await api.delete(`/departments/${id}`);
      showToast('success', 'Deleted', 'Department deleted');
      fetchDepartments();
    } catch (err: any) {
      showToast('error', 'Error', err.response?.data?.error || 'Delete error');
    }
  };

  return (
    <DashboardLayout title="Department Management" subtitle="Academic departments and program codes">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-slate-900 text-sm">All Departments</h3>
        <button
          onClick={() => {
            setEditingDept(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all"
        >
          <Plus className="h-4 w-4" /> Add Department
        </button>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        {loading ? (
          <p className="text-sm text-slate-400 py-8 text-center">Loading departments...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400 font-extrabold">
                  <th className="py-3 px-4">Department Name</th>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Created At</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {departments.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-semibold text-slate-900">{d.name}</td>
                    <td className="py-4 px-4 font-mono font-bold text-blue-600">{d.code}</td>
                    <td className="py-4 px-4 text-slate-600">{new Date(d.created_at).toLocaleDateString()}</td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingDept(d);
                          setShowModal(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(d.id, d.name)}
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

      <DepartmentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchDepartments}
        editingDept={editingDept}
      />
    </DashboardLayout>
  );
};
