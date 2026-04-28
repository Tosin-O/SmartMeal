'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

export default function ProfilePage() {
  const router = useRouter();

  // --- STATE MANAGEMENT ---
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Form State
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [budgetPeriod, setBudgetPeriod] = useState<'Weekly' | 'Monthly'>('Weekly');
  const [allergiesInput, setAllergiesInput] = useState('');

  // --- FETCH USER DATA ---
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }
      
      try {
        setUserId(user.uid);
        setEmail(user.email || '');
        setDisplayName(user.displayName || '');

        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          if (data.displayName) setDisplayName(data.displayName);
          if (data.budgetAmount) setBudgetAmount(data.budgetAmount.toString());
          if (data.budgetPeriod) setBudgetPeriod(data.budgetPeriod);
          
          // Convert allergies array back to a comma-separated string for the input field
          if (data.allergies && Array.isArray(data.allergies)) {
            setAllergiesInput(data.allergies.join(', '));
          }
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // --- SAVE ACTION ---
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setIsSaving(true);
    setFeedback(null);

    try {
      // Clean and convert allergies string back to an array
      const allergyArray = allergiesInput
        .split(',')
        .map(a => a.trim())
        .filter(a => a !== '');

      const userDocRef = doc(db, 'users', userId);
      
      // Using setDoc with merge: true safely updates existing fields or creates them if missing
      await setDoc(userDocRef, {
        displayName: displayName.trim(),
        budgetAmount: Number(budgetAmount) || 0,
        budgetPeriod: budgetPeriod,
        allergies: allergyArray,
        updatedAt: new Date()
      }, { merge: true });

      setFeedback({ type: 'success', message: 'Profile updated successfully! Your meal plans will now use these settings.' });
      
      // Clear success message after 4 seconds
      setTimeout(() => setFeedback(null), 4000);

    } catch (error) {
      console.error("Error saving profile:", error);
      setFeedback({ type: 'error', message: 'Failed to update profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#1CD05D] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pb-20 lg:pb-8">
      <main className="p-6 md:p-8 max-w-[800px] mx-auto w-full animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="mb-10">
          <p className="text-[#1CD05D] text-[10px] font-bold tracking-[0.15em] uppercase mb-2">Account</p>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Profile Settings</h1>
          <p className="text-gray-400 text-sm max-w-xl leading-relaxed">
            Update your personal information and adjust the financial and dietary parameters used by the SmartMeal AI engine.
          </p>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`p-4 mb-8 rounded-xl flex items-start gap-3 border ${
            feedback.type === 'success' 
              ? 'bg-[#13251A] border-[#1CD05D]/30 text-[#1CD05D]' 
              : 'bg-red-950/30 border-red-900/50 text-red-400'
          }`}>
            <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {feedback.type === 'success' 
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              }
            </svg>
            <p className="text-sm font-medium">{feedback.message}</p>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-8">
          
          {/* Section 1: Personal Info */}
          <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6 md:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-white mb-6 border-b border-[#2A2A2A] pb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#1CD05D]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              Personal Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
                <input 
                  type="text" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full py-3.5 px-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl text-white text-sm focus:border-[#1CD05D] outline-none transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  Email Address
                  <span className="text-[9px] bg-[#1A1A1A] px-1.5 py-0.5 rounded text-gray-600">LOCKED</span>
                </label>
                <input 
                  type="email" 
                  value={email}
                  disabled
                  className="w-full py-3.5 px-4 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-gray-500 text-sm cursor-not-allowed opacity-70"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Algorithm Parameters */}
          <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6 md:p-8 shadow-sm">
            <h2 className="text-lg font-bold text-white mb-6 border-b border-[#2A2A2A] pb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#1CD05D]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              Algorithm Parameters
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Target Budget</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₦</span>
                  <input 
                    type="number" 
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full py-3.5 pl-9 pr-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl text-white text-sm font-bold focus:border-[#1CD05D] outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Budget Period</label>
                <div className="relative">
                  <select 
                    value={budgetPeriod}
                    onChange={(e) => setBudgetPeriod(e.target.value as 'Weekly' | 'Monthly')}
                    className="w-full py-3.5 pl-4 pr-10 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl text-white text-sm focus:border-[#1CD05D] outline-none appearance-none transition-colors cursor-pointer"
                  >
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                  <svg className="absolute w-4 h-4 text-gray-500 transform -translate-y-1/2 pointer-events-none right-4 top-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Dietary Restrictions & Allergies</label>
              <input 
                type="text" 
                value={allergiesInput}
                onChange={(e) => setAllergiesInput(e.target.value)}
                placeholder="e.g. Peanuts, Shellfish, Dairy (Comma separated)"
                className="w-full py-3.5 px-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl text-white text-sm focus:border-[#1CD05D] outline-none transition-colors"
              />
              <p className="text-[10px] text-gray-600 mt-2">The AI engine will explicitly avoid scheduling recipes containing these ingredients.</p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex justify-end pt-4">
            <button 
              type="submit"
              disabled={isSaving}
              className="w-full md:w-auto px-10 py-4 rounded-xl font-bold text-sm text-gray-900 bg-[#1CD05D] hover:bg-[#15b04d] hover:shadow-[0_0_20px_rgba(28,208,93,0.2)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                  Saving Changes...
                </>
              ) : (
                'Save Profile Settings'
              )}
            </button>
          </div>

        </form>

      </main>
    </div>
  );
}