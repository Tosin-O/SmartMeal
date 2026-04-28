'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, collection, getDocs, query, where, DocumentData } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

interface UserData {
  displayName: string;
  budgetAmount: number;
  amountSpent: number;
  primaryGoal: string;
}

interface MealPlanItem {
  id: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  title: string;
  source: 'Recipe' | 'Cafeteria';
  cost: number;
  isEaten: boolean;
}

// --- Explicit Types to replace 'any' ---
interface MealData {
  name?: string;
  title?: string;
  source?: 'Recipe' | 'Cafeteria' | string;
  cost?: number | string;
}

interface DayPlan {
  Breakfast?: MealData | null;
  Lunch?: MealData | null;
  Dinner?: MealData | null;
}

interface MealPlanDoc extends DocumentData {
  startDate: { toDate: () => Date };
  endDate: { toDate: () => Date };
  schedule: Record<string, Record<string, DayPlan | undefined>>;
  totalEstimatedCost?: number;
  duration?: string;
}

export default function UserDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  // Dynamic State
  const [userData, setUserData] = useState<UserData | null>(null);
  const [todaysMeals, setTodaysMeals] = useState<MealPlanItem[]>([]);
  
  // Calculated Stats
  const [pantryItemCount, setPantryItemCount] = useState(0);
  const [plannedMealsCount, setPlannedMealsCount] = useState(0);
  const [totalMealPlans, setTotalMealPlans] = useState(0); 

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        // 1. Fetch User Profile & True Financials
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists() || !userDocSnap.data().onboardingCompleted) {
          router.push('/setup');
          return;
        }

        const uData = userDocSnap.data();
        setUserData({
          displayName: uData.displayName || 'User',
          budgetAmount: Number(uData.budgetAmount) || 0,
          amountSpent: Number(uData.amountSpent) || 0, 
          primaryGoal: uData.primaryGoal || 'Manage Diet',
        });

        // 2. Fetch User's Pantry Count
        const pantryQuery = query(collection(db, 'pantry'), where('userId', '==', user.uid));
        const pantrySnap = await getDocs(pantryQuery);
        setPantryItemCount(pantrySnap.size);

        // 3. Fetch User's Active Meal Plans & Calculate Today's Real Meals
        const mealPlansQuery = query(collection(db, 'users', user.uid, 'meal_plans'));
        const mealPlansSnap = await getDocs(mealPlansQuery);
        
        setTotalMealPlans(mealPlansSnap.size); 
        
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        let activePlan: MealPlanDoc | null = null;
        let activePlanId = '';

        for (const docSnap of mealPlansSnap.docs) {
          const plan = docSnap.data() as MealPlanDoc;
          const start = plan.startDate.toDate();
          const end = plan.endDate.toDate();
          
          const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
          const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());

          if (today >= startDay && today <= endDay) {
            activePlan = plan;
            activePlanId = docSnap.id;
            break; 
          }
        }

        const fetchedTodaysMeals: MealPlanItem[] = [];
        let totalMealsInPlan = 0;

        if (activePlan && activePlan.schedule) {
          const startDay = new Date(activePlan.startDate.toDate());
          startDay.setHours(0,0,0,0);
          
          const diffTime = today.getTime() - startDay.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          
          const weekNum = Math.floor(diffDays / 7) + 1;
          const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const currentDayName = dayNames[today.getDay()]; 

          const todaysSchedule = activePlan.schedule[weekNum.toString()]?.[currentDayName] 
                              || activePlan.schedule['1']?.[currentDayName];

          if (todaysSchedule) {
            (['Breakfast', 'Lunch', 'Dinner'] as const).forEach(type => {
              const meal = todaysSchedule[type];
              if (meal) {
                fetchedTodaysMeals.push({
                  id: `${activePlanId}-${type}`,
                  mealType: type,
                  title: meal.name || meal.title || 'Unknown Meal',
                  source: (meal.source as 'Recipe' | 'Cafeteria') || 'Recipe',
                  cost: Number(meal.cost) || 0,
                  isEaten: false, 
                });
              }
            });
          }

          Object.values(activePlan.schedule).forEach((week) => {
            Object.values(week).forEach((day) => {
              if (day) {
                if (day.Breakfast) totalMealsInPlan++;
                if (day.Lunch) totalMealsInPlan++;
                if (day.Dinner) totalMealsInPlan++;
              }
            });
          });
        }
        
        setPlannedMealsCount(totalMealsInPlan);
        setTodaysMeals(fetchedTodaysMeals);

      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#1CD05D] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const safeBudget = userData?.budgetAmount || 1; 
  const spentAmount = userData?.amountSpent || 0;
  const budgetPercentage = Math.min((spentAmount / safeBudget) * 100, 100);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-[#1CD05D] selection:text-white pb-20 lg:pb-8">
      <main className="p-6 md:p-8 max-w-300 w-full animate-in fade-in duration-500">
        
        {/* Welcome Section */}
        <section className="mb-10">
          <p className="text-[#1CD05D] text-sm font-bold tracking-widest uppercase mb-2">Welcome Back</p>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Hi, {userData?.displayName}  👋
          </h1>
          <p className="text-gray-400">
            You&apos;re focusing on <span className="text-white font-medium">{userData?.primaryGoal}</span> this cycle. Let&apos;s check your progress.
          </p>
        </section>

        {/* Quick Stats Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          
          <div className="p-5 bg-[#111111] border border-[#2A2A2A] rounded-2xl transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#1CD05D]/5">
            <svg className="w-6 h-6 text-gray-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            <p className="text-2xl font-bold text-white">{totalMealPlans}</p>
            <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mt-1">Meal Plans</p>
          </div>

          <div className="p-5 bg-[#111111] border border-[#2A2A2A] rounded-2xl transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#1CD05D]/5">
            <svg className="w-6 h-6 text-gray-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
            <p className="text-2xl font-bold text-white">{pantryItemCount}</p>
            <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mt-1">Pantry Items</p>
          </div>
          
          <div className="p-5 bg-[#111111] border border-[#2A2A2A] rounded-2xl col-span-2 transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#1CD05D]/5">
            <div className="flex justify-between items-start mb-3">
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {spentAmount > safeBudget ? (
                <span className="px-2 py-1 text-[10px] font-bold text-red-400 bg-red-950/30 rounded uppercase tracking-wider">Over Budget</span>
              ) : (
                <span className="px-2 py-1 text-[10px] font-bold text-[#1CD05D] bg-[#13251A] rounded uppercase tracking-wider">On Budget</span>
              )}
            </div>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-bold text-white">₦{spentAmount.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mb-1">/ ₦{safeBudget.toLocaleString()}</p>
            </div>
            <div className="w-full h-1.5 mt-3 bg-[#2A2A2A] rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${spentAmount > safeBudget ? 'bg-red-500' : 'bg-[#1CD05D]'}`} style={{ width: `${budgetPercentage}%` }}></div>
            </div>
          </div>
        </section>

        {/* Today's Plan */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Today&apos;s Menu</h2>
            <button 
              onClick={() => router.push('/dashboard/meal-plan')}
              className="text-sm font-bold text-[#1CD05D] hover:underline"
            >
              Plan Settings
            </button>
          </div>
          
          {todaysMeals.length === 0 ? (
            <div className="p-8 bg-[#111111] border border-dashed border-[#2A2A2A] rounded-2xl flex flex-col items-center justify-center text-center">
              <svg className="w-10 h-10 text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              <p className="text-white font-bold mb-1">No meals scheduled for today</p>
              <p className="text-sm text-gray-500 mb-5">Your calendar is currently clear. Generate a new plan to get started.</p>
              <button 
                onClick={() => router.push('/dashboard/meal-plan')}
                className="px-6 py-2.5 bg-[#1CD05D] text-black font-bold text-xs uppercase tracking-widest rounded-lg hover:bg-[#15b04d] transition-colors"
              >
                Create Meal Plan
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {todaysMeals.map((meal) => (
                <div key={meal.id} className={`p-5 border rounded-2xl flex flex-col ${meal.isEaten ? 'bg-[#0A0A0A] border-[#2A2A2A] opacity-60' : 'bg-[#111111] border-[#2A2A2A]'}`}>
                  <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-4">{meal.mealType}</p>
                  <h3 className={`text-lg font-bold mb-1 ${meal.isEaten ? 'text-gray-400 line-through' : 'text-white'}`}>{meal.title}</h3>
                  <p className="text-sm text-gray-400 mb-6">{meal.source} • ₦{meal.cost.toLocaleString()}</p>
                  
                  {!meal.isEaten ? (
                    <button className="mt-auto w-full py-2.5 text-xs font-bold text-gray-900 bg-[#1CD05D] hover:bg-[#15b04d] rounded-lg transition-colors uppercase tracking-widest">
                      Mark as Eaten
                    </button>
                  ) : (
                    <button className="mt-auto w-full py-2.5 text-xs font-bold text-gray-500 border border-[#2A2A2A] rounded-lg uppercase tracking-widest cursor-default">
                      Completed
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Quick Links Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-[#1CD05D]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Quick Links
              </h2>
              <p className="text-sm text-gray-400 mt-1">Handy tools to manage your meals and inventory.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Quick Action 1: Grocery List */}
            <div className="bg-linear-to-br from-[#1CD05D]/20 to-[#111111] border border-[#1CD05D]/30 rounded-2xl p-6 flex flex-col justify-between group transition-all duration-300">
              <div>
                <div className="w-10 h-10 bg-[#1CD05D]/20 rounded-xl flex items-center justify-center text-[#1CD05D] mb-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Check Groceries</h3>
                <p className="text-gray-400 text-sm">Review your automatically generated shopping list before heading to the market.</p>
              </div>
              <button onClick={() => router.push('/dashboard/grocery')} className="mt-6 w-full py-2.5 bg-[#1CD05D] text-black font-bold text-xs uppercase tracking-widest rounded-lg group-hover:bg-[#15b04d] transition-colors">
                View List
              </button>
            </div>

            {/* Quick Action 2: Pantry */}
            <div className="bg-[#111111] border border-[#2A2A2A] hover:border-[#1CD05D]/50 rounded-2xl p-6 flex flex-col justify-between group transition-all duration-300">
              <div>
                <div className="w-10 h-10 bg-[#1A1A1A] rounded-xl flex items-center justify-center text-gray-400 group-hover:text-[#1CD05D] group-hover:bg-[#1CD05D]/10 mb-4 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">My Pantry</h3>
                <p className="text-gray-400 text-sm">Update your current ingredients to keep your AI recommendations accurate.</p>
              </div>
              <button onClick={() => router.push('/dashboard/pantry')} className="mt-6 w-full py-2.5 text-gray-400 font-bold text-xs uppercase tracking-widest rounded-lg border border-[#2A2A2A] group-hover:bg-[#1CD05D] group-hover:text-black group-hover:border-[#1CD05D] transition-colors">
                Manage Pantry
              </button>
            </div>

            {/* Quick Action 3: Meal Planner */}
            <div className="bg-[#111111] border border-[#2A2A2A] hover:border-[#1CD05D]/50 rounded-2xl p-6 flex flex-col justify-between group transition-all duration-300">
              <div>
                <div className="w-10 h-10 bg-[#1A1A1A] rounded-xl flex items-center justify-center text-gray-400 group-hover:text-[#1CD05D] group-hover:bg-[#1CD05D]/10 mb-4 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Meal Planner</h3>
                <p className="text-gray-400 text-sm">Adjust your budget, tweak your diet goals, and plan the upcoming week.</p>
              </div>
              <button onClick={() => router.push('/dashboard/meal-plan')} className="mt-6 w-full py-2.5 text-gray-400 font-bold text-xs uppercase tracking-widest rounded-lg border border-[#2A2A2A] group-hover:bg-[#1CD05D] group-hover:text-black group-hover:border-[#1CD05D] transition-colors">
                Open Planner
              </button>
            </div>

          </div>
        </section>

      </main>
    </div>
  );
}