'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { auth } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // This triggers the exact Firebase email template you configured
      await sendPasswordResetEmail(auth, email);
      setIsSuccess(true);
    } catch (err: any) {
      console.error("Error sending reset email:", err);
      // Handle common Firebase errors gracefully
      if (err.code === 'auth/user-not-found') {
        setError("We couldn't find an account with that email.");
      } else if (err.code === 'auth/invalid-email') {
        setError("Please enter a valid email address.");
      } else {
        setError("Something went wrong. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center p-6 selection:bg-[#1CD05D] selection:text-white">
      
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 text-[#1CD05D] mb-10 transition-transform hover:scale-105">
        <Image src="/logo.svg" alt="SmartMeal Logo" width={40} height={40} />
        <span className="text-2xl font-bold text-white">SmartMeal</span>
      </Link>

      {/* Main Card */}
      <div className="w-full max-w-md bg-[#111111] border border-[#2A2A2A] rounded-2xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
        
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-[#1CD05D] opacity-10 rounded-full blur-3xl"></div>

        {!isSuccess ? (
          <div className="relative z-10 animate-in fade-in duration-500">
            <h1 className="text-2xl font-bold text-white mb-2 text-center">Reset Password</h1>
            <p className="text-sm text-gray-400 text-center mb-8">
              Enter the email address associated with your account and we&apos;ll send you a link to reset your password.
            </p>

            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-xs font-bold text-gray-500 uppercase mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@pau.edu.ng"
                    className="w-full py-3.5 pl-12 pr-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl text-white focus:border-[#1CD05D] outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-lg flex items-start gap-2">
                  <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !email}
                className="w-full py-3.5 text-sm font-bold text-gray-900 bg-[#1CD05D] hover:bg-[#15b04d] rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider flex justify-center items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                    Sending Link...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="relative z-10 animate-in zoom-in-95 duration-500 flex flex-col items-center text-center py-6">
            <div className="w-16 h-16 bg-[#13251A] rounded-full flex items-center justify-center text-[#1CD05D] mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Check your inbox</h2>
            <p className="text-sm text-gray-400 mb-8 leading-relaxed">
              We&apos;ve sent an email to <span className="text-white font-medium">{email}</span> with instructions to reset your password.
            </p>
            <p className="text-xs text-gray-500 mb-8">
              Don&apos;t see it? Check your spam folder.
            </p>
          </div>
        )}

      </div>

      {/* Back to Login */}
      <div className="mt-8">
        <Link href="/login" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to Login
        </Link>
      </div>

    </div>
  );
}