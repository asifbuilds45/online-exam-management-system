import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Unauthorized: React.FC = () => {
  const { user } = useAuth();

  const getHomeRoute = () => {
    if (user?.role === 'admin') return '/admin/dashboard';
    if (user?.role === 'faculty') return '/faculty/dashboard';
    return '/student/dashboard';
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 max-w-md w-full text-center">
        <div className="h-16 w-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">403 Access Denied</h1>
        <p className="text-xs text-slate-500 mt-2 mb-6">
          You do not have permission to view this resource. Your role (<strong>{user?.role || 'Guest'}</strong>) is not authorized.
        </p>

        <Link
          to={getHomeRoute()}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all"
        >
          <ArrowLeft className="h-4 w-4" /> Return to Dashboard
        </Link>
      </div>
    </div>
  );
};
