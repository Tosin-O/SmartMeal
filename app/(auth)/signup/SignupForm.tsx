'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import SocialButton from '../SocialButton';
import PasswordInput from '../PasswordInputs';
import TermsModal from '../../components/TermsModal';
import PrivacyModal from '../../components/PrivacyModal';

export default function SignupForm() {
  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI State
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Modal State
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 1. Validate passwords match
    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    setIsLoading(true);

    try {
      // 2. Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      if (userCredential.user) {
        // 3. Update the profile with the user's name
        await updateProfile(userCredential.user, {
          displayName: fullName
        });

        // 4. Send the verification email using your Firebase template
        await sendEmailVerification(userCredential.user);
      }

      // 5. Show success UI instead of redirecting immediately
      setIsSuccess(true);
      
    } catch (err: unknown) {
      console.error(err);
      // Safely tell TypeScript this is likely a Firebase error object
      const firebaseError = err as { code?: string; message?: string };

      if (firebaseError.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else if (firebaseError.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError('Failed to create account. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center w-full max-w-md px-8 py-12 mx-auto lg:w-1/2">
      
      {/* SUCCESS STATE UI */}
      {isSuccess ? (
        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="w-20 h-20 mx-auto mb-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-[#1CD05D]">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Check your email</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            We&apos;ve sent a verification link to <span className="font-semibold text-gray-900 dark:text-white">{email}</span>. Please click the link to activate your account before logging in.
          </p>
          <Link href="/login" className="inline-flex items-center justify-center w-full py-3.5 text-white font-bold rounded-lg bg-[#1CD05D] hover:bg-[#15b04d] transition-colors">
            Return to Login
          </Link>
        </div>
      ) : (
        /* REGULAR SIGNUP FORM UI */
        <>
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

          {error && (
            <div className="p-3 mb-6 text-sm text-red-500 bg-red-100 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200">Full Name</label>
              <input 
                type="text" 
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe" 
                className="block w-full py-3 px-4 rounded-lg outline-none transition-colors border text-gray-900 bg-white border-gray-200 placeholder-gray-400 focus:border-[#1CD05D] focus:ring-1 focus:ring-[#1CD05D] dark:bg-[#1A1A1A] dark:border-[#2A2A2A] dark:text-white dark:placeholder-gray-500" 
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com" 
                className="block w-full py-3 px-4 rounded-lg outline-none transition-colors border text-gray-900 bg-white border-gray-200 placeholder-gray-400 focus:border-[#1CD05D] focus:ring-1 focus:ring-[#1CD05D] dark:bg-[#1A1A1A] dark:border-[#2A2A2A] dark:text-white dark:placeholder-gray-500" 
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200">Password</label>
              <PasswordInput 
                id="signup-password" 
                name="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-200">Confirm Password</label>
              <PasswordInput 
                id="signup-confirm" 
                name="confirmPassword" 
                placeholder="••••••••" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div className="flex items-start gap-3 mt-4">
              <input type="checkbox" id="terms" required className="w-4 h-4 mt-1 rounded border-gray-300 text-[#1CD05D] focus:ring-[#1CD05D] dark:border-gray-600 dark:bg-[#1A1A1A] dark:checked:bg-[#1CD05D]" />
              <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400">
                I agree to the{' '}
                <button type="button" onClick={() => setIsTermsOpen(true)} className="font-semibold text-[#1CD05D] hover:underline">
                  Terms of Service
                </button>{' '}
                and{' '}
                <button type="button" onClick={() => setIsPrivacyOpen(true)} className="font-semibold text-[#1CD05D] hover:underline">
                  Privacy Policy
                </button>.
              </label>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-3.5 mt-6 text-white font-bold rounded-lg bg-[#1CD05D] hover:bg-[#15b04d] transition-colors disabled:opacity-70 flex justify-center items-center"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="mt-8 text-sm text-center text-gray-600 dark:text-gray-400">
            Already have an account? <Link href="/login" className="font-semibold text-[#1CD05D] hover:underline">Log in</Link>
          </p>
        </>
      )}

      {/* MODALS */}
      <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
      <PrivacyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
    </div>
  );
}