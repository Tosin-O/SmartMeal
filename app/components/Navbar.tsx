import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto w-full">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 text-[#1CD05D]">
        <Image
                src="/logo.svg"
                alt="Logo"
                width={36}
                height={36}
         />
        <span className="text-xl font-bold text-gray-900 dark:text-white lg:text-2xl">SmartMeal</span>
      </Link>

      {/* Center Links (Hidden on Mobile) */}
      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-300">
        <Link href="#features" className="hover:text-gray-900 dark:hover:text-white transition-colors">Features</Link>
        <Link href="#pricing" className="hover:text-gray-900 dark:hover:text-white transition-colors">Pricing</Link>
        <Link href="#recipes" className="hover:text-gray-900 dark:hover:text-white transition-colors">Recipes</Link>
        <Link href="#blog" className="hover:text-gray-900 dark:hover:text-white transition-colors">Blog</Link>
      </div>

      {/* Auth Buttons */}
      <div className="flex items-center gap-4">
        <Link href="/login" className="hidden text-sm font-semibold text-gray-900 md:block dark:text-white hover:text-[#1CD05D] dark:hover:text-[#1CD05D] transition-colors">
          Login
        </Link>
        <Link href="/signup" className="px-5 py-2.5 text-sm font-semibold text-white transition-colors rounded-lg bg-[#1CD05D] hover:bg-[#15b04d]">
          Get Started
        </Link>
      </div>
    </nav>
  );
}