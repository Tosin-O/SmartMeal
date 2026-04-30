'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { collection, query, orderBy, getDocs, Timestamp } from 'firebase/firestore'; 
import { db, auth } from '@/lib/firebase';
import { WeekPlan } from '@/lib/scheduler'; // Adjust path if needed

// --- TYPES ---
interface MealPlanDoc {
  id: string;
  createdAt: Timestamp;
  startDate: Timestamp;
  endDate: Timestamp;
  duration: 'Weekly' | 'Monthly';
  targetBudget: number;
  totalEstimatedCost: number;
  schedule: Record<number, WeekPlan>;
}

export default function MealPlansHistory() {
  const router = useRouter();
  
  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<MealPlanDoc[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<MealPlanDoc | null>(null);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchPlans = async () => {
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (!user) {
          router.push('/login');
          return;
        }

        try {
          const plansRef = collection(db, 'users', user.uid, 'meal_plans');
          // Order by newest first
          const q = query(plansRef, orderBy('createdAt', 'desc'));
          const snapshot = await getDocs(q);
          
          const fetchedPlans: MealPlanDoc[] = [];
          snapshot.forEach(doc => {
            fetchedPlans.push({ id: doc.id, ...doc.data() } as MealPlanDoc);
          });
          
          setPlans(fetchedPlans);
        } catch (err) {
          console.error("Error fetching meal plans:", err);
        } finally {
          setLoading(false);
        }
      });

      return unsubscribe;
    };

    fetchPlans();
  }, [router]);

  // --- HELPERS ---
  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return 'Unknown Date';
    return timestamp.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#1CD05D] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A] text-gray-900 dark:text-white pb-20 lg:pb-8 transition-colors duration-300">
      <main className="p-6 md:p-8 max-w-250 mx-auto w-full animate-in fade-in duration-500">
        
        {/* --- VIEW 1: LIST OF ALL PLANS --- */}
        {!selectedPlan && (
          <div className="space-y-6 mt-2">
            <div className="mb-8">
              <Link href="/dashboard/meal-plan" className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-[#1CD05D] mb-4 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Back to Planner
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">Your Meal Plans</h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm max-w-xl leading-relaxed">
                Review your past and upcoming meal schedules. Click on any plan to see the exact recipes and cost breakdown.
              </p>
            </div>

            {plans.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-gray-300 dark:border-[#2A2A2A] rounded-2xl bg-white dark:bg-[#111111]">
                <div className="w-16 h-16 bg-gray-100 dark:bg-[#1A1A1A] text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No meal plans yet</h3>
                <p className="text-sm text-gray-500 mb-6">You haven&apos;t generated or saved any meal plans.</p>
                <Link href="/planner" className="px-6 py-3 bg-[#1CD05D] text-black dark:text-gray-900 font-bold text-sm rounded-xl hover:bg-[#15b04d] transition-colors">
                  Create Your First Plan
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {plans.map((plan) => (
                  <div 
                    key={plan.id} 
                    onClick={() => setSelectedPlan(plan)}
                    className="group cursor-pointer bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#2A2A2A] hover:border-[#1CD05D] rounded-2xl p-6 transition-all duration-300 flex flex-col"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-[#1A1A1A] flex items-center justify-center text-gray-500 group-hover:text-[#1CD05D] transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                      <span className={`px-2.5 py-1 text-[10px] font-bold rounded uppercase tracking-wider ${plan.totalEstimatedCost > plan.targetBudget ? 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/30' : 'text-green-700 bg-green-50 dark:text-[#1CD05D] dark:bg-[#13251A]'}`}>
                        {plan.duration}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                      {formatDate(plan.startDate)} - {formatDate(plan.endDate)}
                    </h3>
                    
                    <div className="mt-auto pt-6 flex items-end justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Est. Cost</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">₦{plan.totalEstimatedCost?.toLocaleString() || 0}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Budget</p>
                        <p className="text-sm font-bold text-gray-400">₦{plan.targetBudget?.toLocaleString() || 0}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- VIEW 2: PLAN DETAILS --- */}
        {selectedPlan && (
          <div className="space-y-8 animate-in slide-in-from-right-8 duration-300">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
              <div>
                <button 
                  onClick={() => setSelectedPlan(null)} 
                  className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-[#1CD05D] mb-4 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                  Back to All Plans
                </button>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {selectedPlan.duration} Plan Details
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  {formatDate(selectedPlan.startDate)} to {formatDate(selectedPlan.endDate)}
                </p>
              </div>

              {/* High Level Stats Card */}
              <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#2A2A2A] rounded-xl p-4 flex gap-6">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Spent</p>
                  <p className={`text-lg font-bold ${selectedPlan.totalEstimatedCost > selectedPlan.targetBudget ? 'text-red-500' : 'text-[#1CD05D]'}`}>
                    ₦{selectedPlan.totalEstimatedCost?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="w-px bg-gray-200 dark:bg-[#2A2A2A]"></div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Target Budget</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    ₦{selectedPlan.targetBudget?.toLocaleString() || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Render Weeks */}
            <div className="space-y-12">
              {Object.entries(selectedPlan.schedule).map(([weekNum, weekData]) => (
                <div key={weekNum} className="space-y-4">
                  {selectedPlan.duration === 'Monthly' && (
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#1CD05D] text-black text-xs flex items-center justify-center">W{weekNum}</span>
                      Week {weekNum}
                    </h3>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
                    {daysOfWeek.map((day) => {
                      const dayData = weekData[day as keyof WeekPlan];
                      return (
                        <div key={day} className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-[#2A2A2A] flex flex-col">
                          <div className="text-center py-2.5 border-b border-gray-200 dark:border-[#2A2A2A]">
                            <span className="text-[#1CD05D] text-xs font-bold uppercase tracking-widest">{day}</span>
                          </div>
                          <div className="p-3 space-y-3 grow flex flex-col">
                            {(['Breakfast', 'Lunch', 'Dinner'] as const).map(type => {
                              const meal = dayData?.[type];
                              // Safe extraction just like in the main planner
                              const mealData = meal as { name?: string; title?: string; cost?: number; source?: string } | undefined | null;
                              const displayName = mealData?.name || mealData?.title || 'No Meal Scheduled';

                              return (
                                <div key={type} className="flex-1 flex flex-col">
                                  <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">{type}</span>
                                  {meal ? (
                                    <div className="bg-gray-50 dark:bg-[#1A1A1A] p-3 rounded-xl border border-gray-200 dark:border-[#2A2A2A] group relative flex flex-col justify-center min-h-17.5">
                                      
                                      <div className="cursor-default relative group/tooltip w-full h-full flex flex-col justify-between">
                                        <p className="font-bold text-gray-900 dark:text-white text-sm truncate mb-1 pr-1">
                                          {displayName}
                                        </p>
                                        
                                        {/* Hover Tooltip showing full details */}
                                        <div className="absolute z-50 left-1/2 bottom-full mb-2 -translate-x-1/2 hidden group-hover/tooltip:block w-max max-w-55 bg-[#1CD05D] text-black dark:text-gray-900 text-xs py-2 px-3 rounded shadow-xl pointer-events-none text-center">
                                          <p className="font-bold whitespace-normal">{displayName}</p>
                                          <p className="text-[10px] opacity-80 mt-1 uppercase tracking-wider">{mealData?.source} • ₦{mealData?.cost}</p>
                                          <div className="absolute top-full left-1/2 w-2 h-2 bg-[#1CD05D] transform -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
                                        </div>

                                        <p className="text-[10px] font-bold text-gray-500 flex items-center justify-between">
                                          <span className={`${mealData?.source === 'Recipe' ? 'text-[#1CD05D]' : 'text-blue-500 dark:text-blue-400'} uppercase tracking-wider`}>
                                            {mealData?.source}
                                          </span>
                                          <span>₦{mealData?.cost}</span>
                                        </p>
                                      </div>

                                    </div>
                                  ) : (
                                    <div className="bg-gray-50 dark:bg-[#0A0A0A] border border-dashed border-gray-200 dark:border-[#2A2A2A] rounded-xl flex items-center justify-center min-h-17.5 opacity-50">
                                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Empty</span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            
          </div>
        )}
      </main>
    </div>
  );
}