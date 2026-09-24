import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { UserRole } from '../../types';
import { LogIn, Lock, Mail, ShieldAlert } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('student@college.edu');
  const [password, setPassword] = useState('password');
  const [role, setRole] = useState<UserRole>('student');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const handlePresetSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    if (selectedRole === 'student') setEmail('student@college.edu');
    else if (selectedRole === 'faculty') setEmail('faculty@college.edu');
    else if (selectedRole === 'admin') setEmail('admin@college.edu');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userProfile = await login(email, password, role);
      showToast('success', 'Welcome Back!', `Signed in as ${userProfile.full_name} (${userProfile.role})`);

      if (userProfile.role === 'admin') navigate('/admin/dashboard');
      else if (userProfile.role === 'faculty') navigate('/faculty/dashboard');
      else navigate('/student/dashboard');
    } catch (err: any) {
      showToast('error', 'Authentication Failed', err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#172033] via-slate-900 to-[#0f172a] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-slate-100/10 backdrop-blur-lg">
        {/* Brand logo header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-blue-600 text-white items-center justify-center font-black text-2xl shadow-xl shadow-blue-600/40 mb-3">
            OEMS
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Online Exam Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">Sign in with your academic credentials</p>
        </div>

        {/* Quick Demo Role Selector Pills */}
        <div className="mb-6 p-1 bg-slate-100 rounded-2xl flex text-xs font-bold">
          {(['student', 'faculty', 'admin'] as UserRole[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => handlePresetSelect(r)}
              className={`flex-1 py-2 rounded-xl capitalize transition-all ${
                role === r ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
          >
            <LogIn className="h-4 w-4" /> {loading ? 'Signing In...' : `Sign In as ${role.toUpperCase()}`}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-slate-400">
          College ERP OEMS Portal • Demo Accounts Pre-loaded
        </p>
      </div>
    </div>
  );
};
