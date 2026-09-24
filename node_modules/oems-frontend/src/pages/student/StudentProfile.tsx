import React from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, GraduationCap, Building2, ShieldCheck, Phone } from 'lucide-react';

export const StudentProfile: React.FC = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout title="Student Profile" subtitle="Manage your academic account details">
      <div className="max-w-3xl bg-white border border-slate-200/80 rounded-2xl p-8 shadow-sm">
        <div className="flex items-center gap-6 border-b border-slate-100 pb-8 mb-8">
          <div className="h-20 w-20 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-3xl shadow-xl shadow-blue-600/30">
            {user?.full_name?.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{user?.full_name}</h2>
            <p className="text-sm text-slate-500 font-medium">{user?.email}</p>
            <span className="mt-2 inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full uppercase tracking-wider">
              {user?.role} Profile
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <GraduationCap className="h-5 w-5 text-blue-600" />
            <div>
              <span className="text-[11px] font-bold uppercase text-slate-400 block">Registration Number</span>
              <strong className="text-sm font-bold text-slate-800">{user?.registration_number || '24CSE001'}</strong>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <Building2 className="h-5 w-5 text-blue-600" />
            <div>
              <span className="text-[11px] font-bold uppercase text-slate-400 block">Department</span>
              <strong className="text-sm font-bold text-slate-800">{user?.department || 'Computer Science & Engineering'}</strong>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <User className="h-5 w-5 text-blue-600" />
            <div>
              <span className="text-[11px] font-bold uppercase text-slate-400 block">Batch</span>
              <strong className="text-sm font-bold text-slate-800">{user?.batch || 'CSE 2024-2028'}</strong>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <Phone className="h-5 w-5 text-blue-600" />
            <div>
              <span className="text-[11px] font-bold uppercase text-slate-400 block">Phone</span>
              <strong className="text-sm font-bold text-slate-800">{user?.phone || '+1 800 555 0102'}</strong>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
