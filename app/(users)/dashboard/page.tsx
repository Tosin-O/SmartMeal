'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { doc, getDoc, collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

interface UserData {
  displayName: string;
  budgetAmount: number;
  primaryGoal: string;
}

interface Recipe {
  id: string;
  title: string;
  prepTime: string;
  estimatedCost: number;
  image: string;
}

interface MealPlanItem {
  id: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  title: string;
  source: 'Recipe' | 'Cafeteria';
  cost: number;
  isEaten: boolean;
}

export default function UserDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  // Dynamic State
  const [userData, setUserData] = useState<UserData | null>(null);
  const [recommendedRecipes, setRecommendedRecipes] = useState<Recipe[]>([]);
  const [todaysMeals, setTodaysMeals] = useState<MealPlanItem[]>([]);
  
  // Calculated Stats
  const [pantryItemCount, setPantryItemCount] = useState(0);
  const [plannedMealsCount, setPlannedMealsCount] = useState(0);
  const [spentAmount, setSpentAmount] = useState(0);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        // 1. Fetch User Profile
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
          primaryGoal: uData.primaryGoal || 'Manage Diet',
        });

        // 2. Fetch User's Pantry Count
        const pantryQuery = query(collection(db, 'pantry'), where('userId', '==', user.uid));
        const pantrySnap = await getDocs(pantryQuery);
        setPantryItemCount(pantrySnap.size);

        // 3. Fetch User's Active Meal Plans
        const mealPlansQuery = query(collection(db, 'meal_plans'), where('userId', '==', user.uid));
        const mealPlansSnap = await getDocs(mealPlansQuery);
        
        setPlannedMealsCount(mealPlansSnap.size);
        
        let totalSpent = 0;
        const fetchedTodaysMeals: MealPlanItem[] = [];
        
        mealPlansSnap.forEach((docSnap) => {
          const mealData = docSnap.data();
          totalSpent += Number(mealData.cost || 0);
          
          if (mealData.isToday) {
            fetchedTodaysMeals.push({ id: docSnap.id, ...mealData } as MealPlanItem);
          }
        });
        
        setSpentAmount(totalSpent);
        
        const order = { Breakfast: 1, Lunch: 2, Dinner: 3, Snack: 4 };
        fetchedTodaysMeals.sort((a, b) => order[a.mealType] - order[b.mealType]);
        setTodaysMeals(fetchedTodaysMeals);

        // 4. Fetch Real Recipe Recommendations
        const recipesQuery = query(collection(db, 'recipes'), limit(3));
        const recipesSnap = await getDocs(recipesQuery);
        const fetchedRecipes: Recipe[] = [];
        
        recipesSnap.forEach(docSnap => {
          fetchedRecipes.push({ id: docSnap.id, ...docSnap.data() } as Recipe);
        });
        setRecommendedRecipes(fetchedRecipes);

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

  // Safe budget calculation
  const safeBudget = userData?.budgetAmount || 1; 
  const budgetPercentage = Math.min((spentAmount / safeBudget) * 100, 100);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-[#1CD05D] selection:text-white pb-20 lg:pb-8">
      {/* Removed mx-auto and increased max-w to align it left, right next to the sidebar */}
      <main className="p-6 md:p-8 max-w-400 w-full animate-in fade-in duration-500">
        
        {/* Welcome Section */}
        <section className="mb-10">
          <p className="text-[#1CD05D] text-sm font-bold tracking-widest uppercase mb-2">Welcome Back</p>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Hi, {userData?.displayName} 👋
          </h1>
          <p className="text-gray-400">
            You&apos;re focusing on <span className="text-white font-medium">{userData?.primaryGoal}</span> this week. Let&apos;s see your progress.
          </p>
        </section>

        {/* Quick Stats Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="p-5 bg-[#111111] border border-[#2A2A2A] rounded-2xl transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#1CD05D]/5">
            <svg className="w-6 h-6 text-gray-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <p className="text-2xl font-bold text-white">{plannedMealsCount}</p>
            <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mt-1">Meals Planned</p>
          </div>
          <div className="p-5 bg-[#111111] border border-[#2A2A2A] rounded-2xl transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#1CD05D]/5">
            <svg className="w-6 h-6 text-gray-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
            <p className="text-2xl font-bold text-white">{pantryItemCount}</p>
            <p className="text-xs font-bold tracking-widest text-gray-500 uppercase mt-1">Items in Pantry</p>
          </div>
          <div className="p-5 bg-[#111111] border border-[#2A2A2A] rounded-2xl col-span-2 transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#1CD05D]/5">
            <div className="flex justify-between items-start mb-3">
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {spentAmount > (userData?.budgetAmount || 0) ? (
                <span className="px-2 py-1 text-[10px] font-bold text-red-400 bg-red-950/30 rounded uppercase tracking-wider">Over Budget</span>
              ) : (
                <span className="px-2 py-1 text-[10px] font-bold text-[#1CD05D] bg-[#13251A] rounded uppercase tracking-wider">On Budget</span>
              )}
            </div>
            <div className="flex items-end gap-2">
              <p className="text-2xl font-bold text-white">₦{spentAmount.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mb-1">/ ₦{(userData?.budgetAmount || 0).toLocaleString()}</p>
            </div>
            <div className="w-full h-1.5 mt-3 bg-[#2A2A2A] rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${spentAmount > (userData?.budgetAmount || 0) ? 'bg-red-500' : 'bg-[#1CD05D]'}`} style={{ width: `${budgetPercentage}%` }}></div>
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
              Edit Plan
            </button>
          </div>
          
          {todaysMeals.length === 0 ? (
            <div className="p-8 border border-dashed border-[#2A2A2A] rounded-2xl flex flex-col items-center justify-center text-center">
              <svg className="w-10 h-10 text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              <p className="text-white font-bold mb-1">No meals planned for today</p>
              <p className="text-sm text-gray-500">Go to your Meal Plan to start adding recipes or cafeteria items.</p>
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

        {/* Recommendations */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-[#1CD05D]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Suggested For You
              </h2>
              <p className="text-sm text-gray-400 mt-1">Based on your budget and preferences.</p>
            </div>
          </div>

          {recommendedRecipes.length === 0 ? (
            <div className="p-8 bg-[#111111] border border-[#2A2A2A] rounded-2xl text-center">
              <p className="text-gray-500">No recommendations available yet. Try updating your pantry!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedRecipes.map((recipe) => (
                <div key={recipe.id} className="bg-[#111111] border border-[#2A2A2A] rounded-2xl overflow-hidden group cursor-pointer hover:border-gray-500 transition-colors">
                  <div className="relative h-40 w-full bg-[#1A1A1A]">
                    {recipe.image && (
                      <Image src={recipe.image} alt={recipe.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-[#111111] via-transparent to-transparent opacity-90"></div>
                    
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs font-semibold text-white bg-black/50 backdrop-blur-sm px-2 py-1 rounded-md">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {recipe.prepTime}
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <h3 className="text-base font-bold text-white mb-1 truncate">{recipe.title}</h3>
                    <div className="flex justify-between items-end mt-4">
                       <p className="text-sm font-bold text-[#1CD05D]">₦{(recipe.estimatedCost || 0).toLocaleString()} <span className="text-xs text-gray-500 font-normal">est.</span></p>
                       <button className="text-gray-400 hover:text-white transition-colors">
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                       </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}