'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase'; // Adjust path if needed
import SocialButton from '../SocialButton';
import PasswordInput from '../PasswordInputs';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard'); // Redirect to your protected area
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else {
        setError('An error occurred during login. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center w-full max-w-md px-8 py-12 mx-auto lg:w-1/2">
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-6 text-[#1CD05D]">
          <Image
                src="/logo.svg"
                alt="Logo"
                width={36}
                height={36}
         />
          <span className="text-2xl font-bold text-gray-900 dark:text-white">SmartMeal</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Plan your week, shop with ease.</p>
      </div>

      {error && (
        <div className="p-3 mb-4 text-sm text-red-500 bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <input 
              type="email" 
              required
              placeholder="name@company.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="block w-full py-3 pl-11 pr-4 rounded-lg outline-none transition-colors border text-gray-900 bg-white border-gray-200 placeholder-gray-400 focus:border-[#1CD05D] focus:ring-1 focus:ring-[#1CD05D] dark:bg-[#1A1A1A] dark:border-[#2A2A2A] dark:text-white dark:placeholder-gray-500" 
            />
          </div>
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200">Password</label>
          <PasswordInput 
            id="login-password" 
            name="password" 
            placeholder="Enter your password" 
            showLockIcon={true} 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between mt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#1CD05D] focus:ring-[#1CD05D] dark:border-gray-600 dark:bg-[#1A1A1A] dark:checked:bg-[#1CD05D]" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Remember Me</span>
          </label>
          <Link href="/forgot" className="text-sm font-semibold text-[#1CD05D] hover:underline">Forgot Password?</Link>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="flex items-center justify-center w-full gap-2 py-3 mt-4 text-white font-semibold rounded-lg bg-[#1CD05D] hover:bg-[#15b04d] transition-colors disabled:opacity-70"
        >
          {isLoading ? 'Logging in...' : 'Log In'}
          {!isLoading && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
        </button>
      </form>

      <div className="flex items-center w-full my-8">
        <hr className="flex-1 border-gray-200 dark:border-gray-800" />
        <span className="px-4 text-xs font-medium tracking-wider text-gray-400 uppercase">Or continue with</span>
        <hr className="flex-1 border-gray-200 dark:border-gray-800" />
      </div>

      <div className="flex gap-4 mb-8">
        <SocialButton provider="Google" iconPath="/google.svg" />
        <SocialButton provider="Apple" iconPath="/apple.svg" />
      </div>

      <p className="text-sm text-center text-gray-600 dark:text-gray-400">
        Don&apos;t have an account? <Link href="/signup" className="font-semibold text-[#1CD05D] hover:underline">Sign Up</Link>
      </p>
    </div>
  );
}