import Image from 'next/image';
// import Link from 'next/link';

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

export default function DashboardHeader({ setSidebarOpen }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between p-6 bg-[#FAFAFA]/90 dark:bg-[#0A0A0A]/90 backdrop-blur border-b border-gray-200 dark:border-[#2A2A2A]">
      
      {/* Left: Search & Mobile Menu Button */}
      <div className="flex items-center gap-4 flex-1 max-w-lg">
        {/* Mobile Menu Toggle Button (visible on mobile, triggers sidebar) */}
        <button 
          onClick={() => setSidebarOpen(true)}
          className="p-2 -ml-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white lg:hidden"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>

        {/* Search Input (shared across all dashboard pages) */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <input type="search" placeholder="Search recipes, ingredients..." className="w-full py-3 pl-12 pr-4 rounded-xl outline-none transition-colors border text-gray-900 bg-white border-gray-200 placeholder-gray-400 focus:border-[#1CD05D] focus:ring-1 focus:ring-[#1CD05D] dark:bg-[#1A1A1A] dark:border-[#2A2A2A] dark:text-white dark:placeholder-gray-500" />
        </div>
      </div>

      {/* Right: Notifications & Profile */}
      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-400 transition-colors border border-gray-200 rounded-full hover:bg-gray-100 dark:border-[#2A2A2A] dark:hover:bg-[#1A1A1A]">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
        </button>
        <div className="w-10 h-10 overflow-hidden bg-gray-200 rounded-full border-2 border-white dark:border-[#111111]">
          <Image src="/user-avatar.jpg" alt="User profile" width={40} height={40} className="object-cover" />
        </div>
      </div>
    </header>
  );
}