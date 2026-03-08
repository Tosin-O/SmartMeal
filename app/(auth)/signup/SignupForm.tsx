'use client';

import Link from 'next/link';
import SocialButton from '../SocialButton';
import PasswordInput from '../PasswordInputs';

export default function SignupForm() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex flex-col justify-center w-full max-w-md px-8 py-12 mx-auto lg:w-1/2">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Account</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Welcome to SmartMeal! Please enter your details.</p>
      </div>

      <div className="flex gap-4 mb-8">
        <SocialButton provider="Google" iconPath="/google.svg" />
        <SocialButton provider="Apple" iconPath="/apple.svg" />
      </div>

      <div className="flex items-center w-full mb-8">
        <hr className="flex-1 border-gray-200 dark:border-gray-800" />
        <span className="px-4 text-xs font-medium tracking-wider text-gray-400 uppercase">Or sign up with email</span>
        <hr className="flex-1 border-gray-200 dark:border-gray-800" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200">Full Name</label>
          <input type="text" placeholder="John Doe" className="block w-full py-3 px-4 rounded-lg outline-none transition-colors border text-gray-900 bg-white border-gray-200 placeholder-gray-400 focus:border-[#1CD05D] focus:ring-1 focus:ring-[#1CD05D] dark:bg-[#1A1A1A] dark:border-[#2A2A2A] dark:text-white dark:placeholder-gray-500" />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200">Email Address</label>
          <input type="email" placeholder="name@company.com" className="block w-full py-3 px-4 rounded-lg outline-none transition-colors border text-gray-900 bg-white border-gray-200 placeholder-gray-400 focus:border-[#1CD05D] focus:ring-1 focus:ring-[#1CD05D] dark:bg-[#1A1A1A] dark:border-[#2A2A2A] dark:text-white dark:placeholder-gray-500" />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200">Password</label>
          <PasswordInput id="signup-password" name="password" placeholder="••••••••" />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200">Confirm Password</label>
          <PasswordInput id="signup-confirm" name="confirmPassword" placeholder="••••••••" />
        </div>

        <div className="flex items-start gap-3 mt-4">
          <input type="checkbox" id="terms" className="w-4 h-4 mt-1 rounded border-gray-300 text-[#1CD05D] focus:ring-[#1CD05D] dark:border-gray-600 dark:bg-[#1A1A1A] dark:checked:bg-[#1CD05D]" />
          <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400">
            I agree to the <Link href="/terms" className="font-semibold text-[#1CD05D] hover:underline">Terms of Service</Link> and <Link href="/privacy" className="font-semibold text-[#1CD05D] hover:underline">Privacy Policy</Link>.
          </label>
        </div>

        <button type="submit" className="w-full py-3 mt-6 text-white font-semibold rounded-lg bg-[#1CD05D] hover:bg-[#15b04d] transition-colors">
          Create Account
        </button>
      </form>

      <p className="mt-8 text-sm text-center text-gray-600 dark:text-gray-400">
        Already have an account? <Link href="/login" className="font-semibold text-[#1CD05D] hover:underline">Log in</Link>
      </p>
    </div>
  );
}