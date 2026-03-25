'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const mainLinks = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /> },
    { name: 'Recipe Content', href: '/admin/recipes', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /> },
    { name: 'Ingredients', href: '/admin/ingredients', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /> },
    { name: 'Cafeteria', href: '/admin/cafeteria', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /> },
  ];

  const systemLinks = [
    { name: 'Global Settings', href: '/admin/settings', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /> },
  ];

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#111111] border-r border-[#2A2A2A] flex flex-col pt-6 pb-6 overflow-y-auto transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      
      {/* Mobile Close Button (Hidden on Desktop) */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white lg:hidden"
      >
        {/* <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg> */}
      </button>

      {/* Logo */}
      <Link href="/admin/dashboard" className="flex flex-col px-6 mb-10">
        <div className="flex items-center gap-2 text-[#1CD05D]">
          <Image
  src="/logo.svg"
  alt="Logo"
  width={36}
  height={36} 
/>
          <span className="text-xl font-bold text-white">SmartMeal</span>
        </div>
        <span className="text-[10px] font-bold tracking-widest text-[#1CD05D] uppercase mt-1 ml-10">Admin Panel</span>
      </Link>

      {/* Main Navigation */}
      <div className="px-4 space-y-1 mb-8">
        {mainLinks.map((link) => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link key={link.name} href={link.href} className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${isActive ? 'bg-[#13251A] text-[#1CD05D]' : 'text-gray-400 hover:bg-[#1A1A1A] hover:text-gray-200'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">{link.icon}</svg>
              {link.name}
            </Link>
          );
        })}
      </div>

      {/* System Navigation */}
      <div className="px-4 space-y-1 mb-auto">
        <p className="px-4 mb-2 text-xs font-bold tracking-wider text-gray-500 uppercase">System</p>
        {systemLinks.map((link) => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link key={link.name} href={link.href} className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${isActive ? 'bg-[#13251A] text-[#1CD05D]' : 'text-gray-400 hover:bg-[#1A1A1A] hover:text-gray-200'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">{link.icon}</svg>
              {link.name}
            </Link>
          );
        })}
      </div>

      {/* Admin Profile Widget */}
      <div className="px-6 mt-8">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A]">
          <div className="flex items-center justify-center shrink-0 w-8 h-8 text-sm font-bold text-[#1CD05D] bg-[#13251A] rounded-full">
            A
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white truncate">Admin User</p>
            <p className="text-xs text-gray-500 truncate">Chief Editor</p>
          </div>
        </div>
      </div>
    </aside>
  );
}