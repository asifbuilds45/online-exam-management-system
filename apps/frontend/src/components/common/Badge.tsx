import React from 'react';

interface BadgeProps {
  variant?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'blue', children }) => {
  const styles = {
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    green: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    yellow: 'bg-amber-100 text-amber-800 border-amber-200',
    red: 'bg-rose-100 text-rose-800 border-rose-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    gray: 'bg-slate-100 text-slate-700 border-slate-200'
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border capitalize tracking-wide ${styles[variant]}`}
    >
      {children}
    </span>
  );
};
