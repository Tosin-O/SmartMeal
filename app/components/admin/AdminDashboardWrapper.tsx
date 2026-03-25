'use client';

import { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import AdminProtectedRoute from './AdminProtectedRoute';

export default function AdminDashboardWrapper({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-[#0A0A0A] text-white flex selection:bg-[#1CD05D] selection:text-white">
        
        {/* Mobile Sidebar Backdrop */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Sidebar - Controlled by state on mobile */}
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 min-w-0 transition-all duration-300 lg:pl-64">
          
          {/* Mobile Header (Hidden on Desktop) */}
          <AdminHeader setSidebarOpen={setSidebarOpen} />
          
          <main className="flex-1">
            {children}
          </main>
        </div>
        
      </div>
    </AdminProtectedRoute>
  );
}