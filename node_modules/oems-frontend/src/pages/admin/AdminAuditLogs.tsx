import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Badge } from '../../components/common/Badge';
import { ShieldCheck, Search } from 'lucide-react';
import { api } from '../../services/api';
import { AuditLogItem } from '../../types';

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuditLogs = async () => {
      setLoading(true);
      try {
        const res = await api.get('/audit-logs', { params: { search } });
        setLogs(res.data);
      } catch (err) {
        console.error('Failed to load audit logs', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAuditLogs();
  }, [search]);

  return (
    <DashboardLayout title="System Audit Logs" subtitle="Security trail and action log history">
      {/* Search Input */}
      <div className="mb-6 max-w-md">
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter audit logs by action or user email..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        {loading ? (
          <p className="text-sm text-slate-400 py-8 text-center">Loading security logs...</p>
        ) : logs.length === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center">No audit log records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400 font-extrabold">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Entity Type</th>
                  <th className="py-3 px-4">User Email</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 text-xs font-mono text-slate-500">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-900 font-mono text-xs">
                      {log.action}
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="blue">{log.entity_type}</Badge>
                    </td>
                    <td className="py-4 px-4 text-slate-700 text-xs font-semibold">
                      {log.user_email || 'System'}
                    </td>
                    <td className="py-4 px-4 text-xs font-mono text-slate-500 max-w-xs truncate">
                      {JSON.stringify(log.details)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
