import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="w-full px-6 py-12 mx-auto mt-20 border-t max-w-7xl border-gray-200 dark:border-gray-800">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-4 lg:grid-cols-5">
        {/* Brand Column */}
        <div className="lg:col-span-2">
          <Link href="/" className="flex items-center gap-2 mb-4 text-[#1CD05D]">
            <Image
                            src="/logo.svg"
                            alt="Logo"
                            width={24}
                            height={24}
                     />
            <span className="text-xl font-bold text-gray-900 dark:text-white">SmartMeal</span>
          </Link>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs">
            Building the future of home cooking through artificial intelligence and smart logistics. Eat well, live better.
          </p>
          <div className="flex items-center gap-4 mt-6">
            {/* Social Icons Placeholder */}
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700">𝕏</div>
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700">in</div>
          </div>
        </div>

        {/* Links Columns */}
        <div>
          <h3 className="mb-4 text-sm font-semibold tracking-wider text-gray-900 uppercase dark:text-white">Product</h3>
          <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <li><Link href="#" className="hover:text-[#1CD05D]">Features</Link></li>
            <li><Link href="#" className="hover:text-[#1CD05D]">Pricing</Link></li>
            <li><Link href="#" className="hover:text-[#1CD05D]">Recipes</Link></li>
            <li><Link href="#" className="hover:text-[#1CD05D]">App Download</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-semibold tracking-wider text-gray-900 uppercase dark:text-white">Company</h3>
          <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <li><Link href="#" className="hover:text-[#1CD05D]">About Us</Link></li>
            <li><Link href="#" className="hover:text-[#1CD05D]">Blog</Link></li>
            <li><Link href="#" className="hover:text-[#1CD05D]">Careers</Link></li>
            <li><Link href="#" className="hover:text-[#1CD05D]">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-semibold tracking-wider text-gray-900 uppercase dark:text-white">Legal</h3>
          <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <li><Link href="#" className="hover:text-[#1CD05D]">Privacy Policy</Link></li>
            <li><Link href="#" className="hover:text-[#1CD05D]">Terms of Service</Link></li>
            <li><Link href="#" className="hover:text-[#1CD05D]">Cookie Policy</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row items-center justify-between pt-8 mt-12 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-500">
        <p>© 2024 SmartMeal Technologies Inc. All rights reserved.</p>
        <div className="flex gap-4 mt-4 md:mt-0">
          <span>🌐 English</span>
          <span>🛡️ Safe & Secure</span>
        </div>
      </div>
    </footer>
  );
}