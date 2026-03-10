'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: <path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /> },
    { name: 'Meal Plan', href: '/dashboard/meal-plan', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
    { name: 'Grocery List', href: '/dashboard/grocery', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /> },
    { name: 'Pantry Stock', href: '/dashboard/pantry', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /> },
  ];

  const insightLinks = [
    { name: 'Market Trends', href: '/dashboard/trends', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /> },
    { name: 'Spending History', href: '/dashboard/history', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /> },
  ];

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#111111] border-r border-gray-200 dark:border-[#2A2A2A] flex flex-col pt-6 pb-4 overflow-y-auto transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}> 
    {/* Mobile Close Button - visible only when open on mobile */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white lg:hidden"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>

      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-2 px-6 mb-10 text-[#1CD05D]">
        <Image
                        src="/logo.svg"
                        alt="Logo"
                        width={36}
                        height={36}
                 />
        <span className="text-xl font-bold text-gray-900 dark:text-white">SmartMeal</span>
      </Link>

      {/* Main Navigation */}
      <div className="px-4 space-y-1 mb-8">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link key={link.name} href={link.href} className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${isActive ? 'bg-green-50 dark:bg-green-900/20 text-[#1CD05D]' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1A1A1A] hover:text-gray-900 dark:hover:text-gray-200'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">{link.icon}</svg>
              {link.name}
            </Link>
          );
        })}
      </div>

      {/* Analytics & Insights */}
      <div className="px-4 space-y-1 mb-auto">
        <p className="px-4 mb-2 text-xs font-bold tracking-wider text-gray-400 uppercase">Analytics & Insights</p>
        {insightLinks.map((link) => (
          <Link key={link.name} href={link.href} className="flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1A1A1A] hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">{link.icon}</svg>
            {link.name}
          </Link>
        ))}
      </div>

      {/* Budget Widget */}
      <div className="px-6 mt-8">
        <div className="p-4 border rounded-2xl bg-white dark:bg-[#1A1A1A] border-gray-200 dark:border-[#2A2A2A] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-bold text-gray-500 tracking-wider uppercase">Budget Status</h4>
            <span className="px-2 py-1 text-[10px] font-bold text-[#1CD05D] bg-green-100 dark:bg-green-900/30 rounded uppercase">On Track</span>
          </div>
          <div className="flex items-end justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Weekly Spent</span>
            <span className="font-bold text-gray-900 dark:text-white">₦15,400</span>
          </div>
          <div className="w-full h-2 mb-4 bg-gray-100 dark:bg-[#2A2A2A] rounded-full overflow-hidden">
            <div className="h-full bg-[#1CD05D] rounded-full" style={{ width: '60%' }}></div>
          </div>
          <div className="flex justify-between text-xs">
            <div>
              <p className="text-gray-500 dark:text-gray-400 mb-0.5">Remaining</p>
              <p className="font-bold text-gray-900 dark:text-white">₦9,600</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500 dark:text-gray-400 mb-0.5">Projected</p>
              <p className="font-bold text-[#1CD05D]">₦23,200</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}