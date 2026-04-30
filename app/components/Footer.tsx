import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 dark:border-gray-800 mt-20 py-8">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Project Logo / Name */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 text-[#1CD05D]">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={24}
              height={24}
            />
            <span className="text-xl font-bold text-gray-900 dark:text-white">SmartMeal</span>
          </Link>
        </div>

        {/* Simple Project Note */}
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          © {new Date().getFullYear()} SmartMeal. All rights reserved.
        </p>

        {/* Simple Text Links */}
        <div className="flex items-center gap-6 text-sm font-medium text-gray-500 dark:text-gray-400">
          <Link href="https://github.com/Tosin-O" target="_blank" rel="noopener noreferrer" className="hover:text-[#1CD05D] transition-colors">
            GitHub
          </Link>
          <Link href="https://my-portfolio-tosin-os-projects.vercel.app" target="_blank" rel="noopener noreferrer" className="hover:text-[#1CD05D] transition-colors">
            Portfolio
          </Link>
        </div>
      </div>
    </footer>
  );
}