'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import SocialButton from '../SocialButton';
import PasswordInput from '../PasswordInputs';

export default function SignupForm() {
  const router = useRouter();
  
  // State for all inputs
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      
      // 3. Update the profile with the user's name
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: fullName
        });
      }

      // 4. Redirect to login
      router.push('/login'); 
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else if (err.code === 'auth/weak-password') {
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
        <div className="p-3 mb-4 text-sm text-red-500 bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-400">
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
            I agree to the <Link href="/terms" className="font-semibold text-[#1CD05D] hover:underline">Terms of Service</Link> and <Link href="/privacy" className="font-semibold text-[#1CD05D] hover:underline">Privacy Policy</Link>.
          </label>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full py-3 mt-6 text-white font-semibold rounded-lg bg-[#1CD05D] hover:bg-[#15b04d] transition-colors disabled:opacity-70"
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <p className="mt-8 text-sm text-center text-gray-600 dark:text-gray-400">
        Already have an account? <Link href="/login" className="font-semibold text-[#1CD05D] hover:underline">Log in</Link>
      </p>
    </div>
  );
}