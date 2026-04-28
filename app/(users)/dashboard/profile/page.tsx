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
      
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll up to see the success message
      setTimeout(() => setFeedback(null), 4000);

    } catch (error) {
      console.error("Error saving profile:", error);
      setFeedback({ type: 'error', message: 'Failed to update profile. Please try again.' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // Count active allergies for the stats card
  const activeAllergiesCount = allergiesInput.split(',').filter(a => a.trim() !== '').length;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pb-20 lg:pb-8">
      <main className="p-6 md:p-8 max-w-250 mx-auto w-full animate-in fade-in duration-500">
        
        {/* Back Button */}
        <button 
                onClick={() => router.push('/dashboard')} 
                className="text-gray-500 hover:text-[#1CD05D] transition-colors p-1 -ml-2 rounded-lg"
                title="Back to Dashboard"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
              </button>

        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-[#1CD05D] text-[10px] font-bold tracking-[0.15em] uppercase mb-2">Account Hub</p>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Profile Settings</h1>
            <p className="text-gray-400 text-sm max-w-md leading-relaxed">
              Update your personal information and adjust the financial and dietary parameters used by the AI engine.
            </p>
          </div>
          
          {/* Quick Overview Stats */}
          <div className="flex gap-4">
             <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-4 min-w-35 flex flex-col justify-center">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Target Budget</p>
                <div className="flex items-end gap-1">
                  <p className="text-2xl font-bold text-white">₦{Number(budgetAmount).toLocaleString()}</p>
                  <span className="text-[10px] text-gray-500 mb-1 uppercase">/{budgetPeriod.slice(0,2)}</span>
                </div>
             </div>
             <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-4 min-w-30 flex flex-col justify-center">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Dietary Rules</p>
                <p className="text-2xl font-bold text-[#1CD05D]">{activeAllergiesCount} Active</p>
             </div>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`p-4 mb-8 rounded-xl flex items-center gap-3 border shadow-lg animate-in slide-in-from-top-4 duration-300 ${
            feedback.type === 'success' 
              ? 'bg-linear-to-r from-[#1CD05D]/20 to-[#111111] border-[#1CD05D]/30 text-[#1CD05D]' 
              : 'bg-linear-to-r from-red-500/20 to-[#111111] border-red-500/30 text-red-400'
          }`}>
            <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {feedback.type === 'success' 
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              }
            </svg>
            <p className="text-sm font-bold tracking-wide">{feedback.message}</p>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Section 1: Personal Info */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6 md:p-8 shadow-sm h-full">
                <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] flex items-center justify-center text-[#1CD05D]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  Personal Details
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-[#1CD05D] transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <input 
                        type="text" 
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full py-3.5 pl-11 pr-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl text-white text-sm focus:border-[#1CD05D] focus:bg-[#111111] hover:border-gray-600 outline-none transition-all"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                       <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                       <span className="text-[9px] bg-gray-900/50 border border-gray-800 text-gray-500 px-2 py-0.5 rounded font-bold tracking-widest flex items-center gap-1">
                          <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                          LOCKED
                       </span>
                    </div>
                    <div className="relative opacity-60">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      </div>
                      <input 
                        type="email" 
                        value={email}
                        disabled
                        className="w-full py-3.5 pl-11 pr-4 bg-transparent border border-dashed border-gray-700 rounded-xl text-gray-400 text-sm cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Algorithm Parameters */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6 md:p-8 shadow-sm h-full flex flex-col">
                <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] flex items-center justify-center text-[#1CD05D]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  </div>
                  Algorithm Parameters
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Target Budget</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 font-bold group-focus-within:text-[#1CD05D] transition-colors">
                        ₦
                      </div>
                      <input 
                        type="number" 
                        value={budgetAmount}
                        onChange={(e) => setBudgetAmount(e.target.value)}
                        placeholder="0"
                        min="0"
                        className="w-full py-3.5 pl-9 pr-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl text-white text-sm font-bold focus:border-[#1CD05D] focus:bg-[#111111] hover:border-gray-600 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Budget Period</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-[#1CD05D] transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                      <select 
                        value={budgetPeriod}
                        onChange={(e) => setBudgetPeriod(e.target.value as 'Weekly' | 'Monthly')}
                        className="w-full py-3.5 pl-11 pr-10 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl text-white text-sm focus:border-[#1CD05D] focus:bg-[#111111] hover:border-gray-600 outline-none appearance-none transition-all cursor-pointer"
                      >
                        <option value="Weekly">Weekly Cycle</option>
                        <option value="Monthly">Monthly Cycle</option>
                      </select>
                      <svg className="absolute w-4 h-4 text-gray-500 transform -translate-y-1/2 pointer-events-none right-4 top-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>

                <div className="mt-auto">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Dietary Restrictions & Allergies</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-yellow-500 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <input 
                      type="text" 
                      value={allergiesInput}
                      onChange={(e) => setAllergiesInput(e.target.value)}
                      placeholder="e.g. Peanuts, Shellfish, Dairy (Comma separated)"
                      className="w-full py-3.5 pl-11 pr-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl text-white text-sm focus:border-yellow-500 focus:bg-[#111111] hover:border-gray-600 outline-none transition-all"
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 mt-2 flex items-center gap-1.5">
                    <svg className="w-3 h-3 text-[#1CD05D]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    The AI engine will automatically filter out recipes containing these ingredients.
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Action Bar */}
          <div className="pt-6 border-t border-[#2A2A2A] flex justify-end">
            <button 
              type="submit"
              disabled={isSaving}
              className="w-full md:w-auto px-12 py-4 rounded-xl font-bold text-sm text-gray-900 bg-[#1CD05D] hover:bg-[#15b04d] shadow-[0_0_15px_rgba(28,208,93,0.15)] hover:shadow-[0_0_25px_rgba(28,208,93,0.3)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-widest"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                  Saving Details...
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