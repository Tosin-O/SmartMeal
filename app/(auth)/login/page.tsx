'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  
  // State for form inputs and UI feedback
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Firebase authentication attempt
      await signInWithEmailAndPassword(auth, email, password);
      
      // If successful, redirect to the dashboard
      router.push('/dashboard'); 
    } catch (err: any) {
      // Map Firebase error codes to user-friendly messages
      console.error('Login error:', err.code);
      if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please try again.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Try again later.');
      } else {
        setError('An error occurred during login. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md rounded-2xl bg-gray-800 p-8 shadow-2xl border border-gray-700">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-white">Welcome Back</h1>
          <p className="mt-2 text-gray-400">Log in to your Smart Meal account</p>
        </div>

        {/* Error Message Alert */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/50 p-3 text-sm text-red-400 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-900 p-3 text-white placeholder-gray-500 transition focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              {/* Optional: Add a "Forgot Password" link here later */}
            </div>
            <input
              type="password"
              id="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-900 p-3 text-white placeholder-gray-500 transition focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full rounded-lg bg-purple-600 p-3 font-bold text-white transition hover:bg-purple-700 active:scale-[0.98] ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-8 border-t border-gray-700 pt-6 text-center">
          <p className="text-gray-400">
            New to Smart Meal?{' '}
            <Link href="/signup" className="font-semibold text-purple-400 hover:text-purple-300 transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}