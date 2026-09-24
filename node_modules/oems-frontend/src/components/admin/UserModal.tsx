import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { UserProfile, Department, Batch } from '../../types';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingUser?: UserProfile | null;
  departments: Department[];
  batches: Batch[];
}

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingUser,
  departments,
  batches
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'student' | 'faculty' | 'admin'>('student');
  const [deptId, setDeptId] = useState('');
  const [batchId, setBatchId] = useState('');
  const [regNum, setRegNum] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useNotification();

  useEffect(() => {
    if (editingUser) {
      setFullName(editingUser.full_name);
      setEmail(editingUser.email);
      setRole(editingUser.role);
      setDeptId(editingUser.department_id || '');
      setBatchId(editingUser.batch_id || '');
      setRegNum(editingUser.registration_number || '');
      setPhone(editingUser.phone || '');
    } else {
      setFullName('');
      setEmail('');
      setRole('student');
      setDeptId('');
      setBatchId('');
      setRegNum('');
      setPhone('');
    }
  }, [editingUser, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, {
          full_name: fullName,
          role,
          department_id: deptId || undefined,
          batch_id: batchId || undefined,
          registration_number: regNum || undefined,
          phone: phone || undefined
        });
        showToast('success', 'User Updated', 'User profile saved successfully.');
      } else {
        await api.post('/users', {
          full_name: fullName,
          email,
          role,
          department_id: deptId || undefined,
          batch_id: batchId || undefined,
          registration_number: regNum || undefined,
          phone: phone || undefined
        });
        showToast('success', 'User Created', 'New user account created successfully.');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast('error', 'Operation Failed', err.response?.data?.error || 'User save error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingUser ? 'Edit User Profile' : 'Add New User'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Full Name
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Dr. Priya Sharma"
            className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Email Address
          </label>
          <input
            type="email"
            required
            disabled={Boolean(editingUser)}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@college.edu"
            className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Reg / Roll Number
            </label>
            <input
              type="text"
              value={regNum}
              onChange={(e) => setRegNum(e.target.value)}
              placeholder="e.g. 24CSE001"
              className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Department
            </label>
            <select
              value={deptId}
              onChange={(e) => setDeptId(e.target.value)}
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
              Batch (Students)
            </label>
            <select
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              disabled={role !== 'student'}
              className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100"
            >
              <option value="">Select Batch</option>
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
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
            {loading ? 'Saving...' : editingUser ? 'Update Profile' : 'Create User'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
