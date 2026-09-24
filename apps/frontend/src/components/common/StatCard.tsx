import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  color?: string;
  change?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  color = 'bg-blue-500'
}) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${color} bg-opacity-10 text-blue-600`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      <strong className="block text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">
        {value}
      </strong>
    </div>
  );
};
