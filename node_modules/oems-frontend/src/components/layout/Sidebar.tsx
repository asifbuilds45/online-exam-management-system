import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  FilePlus,
  Calendar,
  Award,
  Users,
  Building2,
  GraduationCap,
  ShieldCheck,
  FileQuestion,
  LogOut,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  const role = user?.role || 'student';

  const navItems = {
    student: [
      { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/student/exams', label: 'My Exams', icon: Calendar },
      { to: '/student/results', label: 'Results', icon: Award },
      { to: '/student/profile', label: 'Profile', icon: UserCheck }
    ],
    faculty: [
      { to: '/faculty/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/faculty/questions', label: 'Question Bank', icon: BookOpen },
      { to: '/faculty/questions/new', label: 'Add Question', icon: FilePlus },
      { to: '/faculty/exams/new', label: 'Create Exam', icon: Calendar },
      { to: '/faculty/exams', label: 'Scheduled Exams', icon: FileQuestion },
      { to: '/faculty/results', label: 'Results & Grading', icon: Award }
    ],
    admin: [
      { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/admin/users', label: 'User Management', icon: Users },
      { to: '/admin/departments', label: 'Departments', icon: Building2 },
      { to: '/admin/batches', label: 'Batches', icon: GraduationCap },
      { to: '/admin/exams', label: 'All Exams', icon: Calendar },
      { to: '/admin/questions', label: 'Question Bank', icon: BookOpen },
      { to: '/admin/audit-logs', label: 'Audit Logs', icon: ShieldCheck }
    ]
  };

  const currentNav = navItems[role] || navItems.student;

  return (
    <aside className="w-64 bg-[#172033] text-slate-200 flex flex-col fixed top-0 bottom-0 left-0 z-30 shadow-xl">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-blue-500/30">
            O
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-wider text-white">OEMS</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Exam Management</p>
          </div>
        </div>
        <div className="mt-4 inline-block px-3 py-1 bg-slate-800 text-blue-400 text-xs font-bold rounded-full uppercase tracking-wider">
          {role} portal
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {currentNav.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer User Info & Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-9 w-9 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="truncate">
              <p className="text-sm font-semibold text-white truncate">{user?.full_name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
