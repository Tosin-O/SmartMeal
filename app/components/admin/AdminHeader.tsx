import Image from 'next/image'; // <-- 1. Add this import

interface AdminHeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

export default function AdminHeader({ setSidebarOpen }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between p-4 lg:hidden bg-[#0A0A0A]/90 backdrop-blur border-b border-[#2A2A2A]">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setSidebarOpen(true)}
          className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        
        {/* 2. UPDATE THE LOGO SECTION HERE */}
        <div className="flex items-center gap-3">
          <Image 
            src="/logo.svg" 
            alt="Logo" 
            width={24} 
            height={24} 
          />
          <span className="text-lg font-bold text-white tracking-tight">SmartMeal Admin</span>
        </div>
      </div>
    </header>
  );
}