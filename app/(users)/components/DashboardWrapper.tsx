'use client';

import { useState } from 'react';
import Sidebar from './SideBar';
import DashboardHeader from './DashboardHeader';
import ProtectedRoute from '../components/ProtectedRoute';

export default function DashboardWrapper({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0A0A] flex">
        
        {/* Mobile Sidebar Backdrop - shown only when sidebar is open on mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Sidebar - Controlled by state on mobile */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 lg:pl-64">
          
          {/* Dashboard Header - Includes mobile menu toggle button */}
          <DashboardHeader setSidebarOpen={setSidebarOpen} />
          
          <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}