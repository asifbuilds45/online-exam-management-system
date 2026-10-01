import React, { useState, useEffect } from 'react';
import { Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { NotificationItem } from '../../types';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data);
      } catch (err) {
        // silent catch
      }
    };
    if (user) fetchNotifications();
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      // silent
    }
  };

  const toggleSingleRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/toggle`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: !n.is_read } : n))
      );
    } catch (err) {
      // silent
    }
  };

  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4 self-end sm:self-auto">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 bg-white text-slate-600 hover:text-blue-600 rounded-xl border border-slate-200/80 shadow-sm transition-all"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-3 z-50 animate-fade-in">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-blue-600 hover:underline font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                {notifications.length === 0 ? (
                  <p className="p-4 text-xs text-slate-400 text-center">No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 text-xs flex items-start justify-between gap-2 ${
                        !n.is_read ? 'bg-blue-50/50 font-medium' : ''
                      }`}
                    >
                      <div>
                        <p className="font-semibold text-slate-800">{n.title}</p>
                        <p className="text-slate-500 mt-0.5">{n.message}</p>
                      </div>
                      <button
                        onClick={() => toggleSingleRead(n.id)}
                        className={`text-[10px] px-2 py-0.5 rounded font-bold shrink-0 transition-colors ${
                          n.is_read
                            ? 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                        title={n.is_read ? 'Mark as Unread' : 'Mark as Read'}
                      >
                        {n.is_read ? 'Unread' : 'Read'}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Card */}
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200/80 shadow-sm">
          <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
            <User className="h-4 w-4" />
          </div>
          <div className="text-left hidden md:block">
            <p className="text-xs font-bold text-slate-900 leading-tight">{user?.full_name}</p>
            <p className="text-[11px] text-slate-400 uppercase tracking-wider">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
