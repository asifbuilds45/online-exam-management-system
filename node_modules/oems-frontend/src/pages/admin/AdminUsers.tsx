import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Badge } from '../../components/common/Badge';
import { UserModal } from '../../components/admin/UserModal';
import { Plus, Search, UserCheck, UserX, Edit } from 'lucide-react';
import { api } from '../../services/api';
import { UserProfile, Department, Batch } from '../../types';
import { useNotification } from '../../context/NotificationContext';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);

  const [roleFilter, setRoleFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  const { showToast } = useNotification();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users', {
        params: { role: roleFilter, search }
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchResources = async () => {
    try {
      const [deptRes, batchRes] = await Promise.all([api.get('/departments'), api.get('/batches')]);
      setDepartments(deptRes.data);
      setBatches(batchRes.data);
    } catch (err) {
      // silent
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, search]);

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await api.patch(`/users/${id}/toggle-status`);
      showToast('success', 'Status Updated', res.data.message);
      fetchUsers();
    } catch (err: any) {
      showToast('error', 'Update Failed', err.response?.data?.error || 'Status update error');
    }
  };

  return (
    <DashboardLayout title="User Management" subtitle="Manage student, faculty, and administrator accounts">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex flex-1 items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or registration number..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="py-2.5 px-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Roles</option>
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button
          onClick={() => {
            setEditingUser(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all"
        >
          <Plus className="h-4 w-4" /> Add User
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        {loading ? (
          <p className="text-sm text-slate-400 py-8 text-center">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400 font-extrabold">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Reg / Roll Number</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 font-semibold text-slate-900">{u.full_name}</td>
                    <td className="py-4 px-4 text-slate-600">{u.email}</td>
                    <td className="py-4 px-4 text-slate-600 font-mono text-xs font-bold">
                      {u.registration_number || 'N/A'}
                    </td>
                    <td className="py-4 px-4">
                      <Badge
                        variant={
                          u.role === 'admin'
                            ? 'purple'
                            : u.role === 'faculty'
                            ? 'blue'
                            : 'gray'
                        }
                      >
                        {u.role.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant={u.status === 'active' ? 'green' : 'red'}>
                        {u.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingUser(u);
                          setShowModal(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit User"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(u.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          u.status === 'active'
                            ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                            : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={u.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        {u.status === 'active' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <UserModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchUsers}
        editingUser={editingUser}
        departments={departments}
        batches={batches}
      />
    </DashboardLayout>
  );
};
