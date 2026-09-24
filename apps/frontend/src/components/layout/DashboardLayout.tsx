import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-[#f4f7fb] flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="ml-64 flex-1 p-8 overflow-y-auto">
        <Header title={title} subtitle={subtitle} />
        <div className="animate-fade-in">{children}</div>
      </main>
    </div>
  );
};
