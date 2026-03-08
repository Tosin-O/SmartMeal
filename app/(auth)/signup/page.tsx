// app/(auth)/signup/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // for redirecting after success
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase"; // Import from your utility file
import { doc, setDoc } from "firebase/firestore"; // For creating a user record

export default function SignupPage() {
  const router = useRouter();
  
  // 1. Add State for the form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null); // State for error display

  // 2. The form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear errors

    try {
      console.log("Starting signup...");
      // A. Call Firebase to create the user in the Auth database
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log("Auth user created:", user.uid);

      // B. (Optional but crucial for your project) 
      // Update the user's display name
      await updateProfile(user, { displayName: name });

      // C. CREATE A RECORD IN THE FIRESTORE DATABASE
      // We are writing a new document in the 'users' collection
      // where the document ID matches the unique ID (uid) from Auth.
      console.log("Creating Firestore record for user...");
      await setDoc(doc(db, "users", user.uid), {
        fullName: name,
        email: email,
        dietaryPreferences: [], // An initial placeholder array
        currentPlan: "starter",
        createdAt: new Date(),
      });
      
      console.log("Firestore record created.");
      
      // D. Successfully registered! Redirect to the dashboard
      router.push('/login'); // Redirect to login page after successful signup

    } catch (err: any) {
      console.error("Signup error:", err);
      // Firebase errors are specific, but we will make it simple for the user.
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else {
        setError('Failed to create account. Please try again.');
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl bg-gray-800 p-8 shadow-xl">
        <h1 className="mb-6 text-3xl font-bold text-white text-center">Start Your Smart Meal Journey</h1>
        
        {/* Error Display */}
        {error && (
          <div className="mb-4 text-center rounded bg-red-900/50 p-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300">Full Name</label>
            <input type="text" id="name" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-700 p-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email Address</label>
            <input type="email" id="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-700 p-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
            <input type="password" id="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-700 p-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500" />
          </div>
        </div>

        <button type="submit" className="mt-8 w-full rounded-lg bg-purple-600 p-3 font-semibold text-white transition hover:bg-purple-700">
          Create Account
        </button>

        <p className="mt-6 text-center text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-purple-400 hover:text-purple-300">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}