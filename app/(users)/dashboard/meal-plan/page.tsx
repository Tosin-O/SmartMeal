'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { doc, getDoc, collection, getDocs, addDoc, query, orderBy, limit, serverTimestamp } from 'firebase/firestore'; 
import { db, auth } from '@/lib/firebase';
import { distributeMeals, WeekPlan, MissingIngredient } from '@/lib/scheduler';

interface DatabaseItem {
  id: string;
  title: string;
  source: 'Recipe' | 'Cafeteria';
  cost: number;
  image?: string;
  ingredients?: any[]; 
}

export default function MealPlanner() {
  const router = useRouter();

  // --- STATE MANAGEMENT ---
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Custom Toast State
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // User Context State
  const [userId, setUserId] = useState<string | null>(null);
  const [isFetchingUser, setIsFetchingUser] = useState(true);

  // Form Configuration State
  const [mode, setMode] = useState<'Auto' | 'Manual'>('Auto');
  const [duration, setDuration] = useState<'Weekly' | 'Monthly'>('Weekly');
  const [dbBudget, setDbBudget] = useState<number>(0); 
  const [dbBudgetPeriod, setDbBudgetPeriod] = useState<'Weekly' | 'Monthly'>('Monthly');
  const [userAllergies, setUserAllergies] = useState<string[]>([]);
  const [userPantry, setUserPantry] = useState<string[]>([]); 
  
  // Store prices from the market_ingredients collection
  const [ingredientPrices, setIngredientPrices] = useState<Record<string, number>>({}); 

  // Dashboard Results State
  const [generatedPlan, setGeneratedPlan] = useState<Record<number, WeekPlan> | null>(null);
  const [currentWeek, setCurrentWeek] = useState<number>(1);
  const [shoppingList, setShoppingList] = useState<MissingIngredient[]>([]);
  const [totalSpent, setTotalSpent] = useState<number>(0);
  
  // Date Display State
  const [planStartDate, setPlanStartDate] = useState<Date | null>(null);
  const [planEndDate, setPlanEndDate] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Modal State for Manual Editing
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDay, setActiveDay] = useState<keyof WeekPlan>('Mon');
  const [activeMealType, setActiveMealType] = useState<'Breakfast' | 'Lunch' | 'Dinner'>('Breakfast');
  const [availableMeals, setAvailableMeals] = useState<DatabaseItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchingDB, setIsSearchingDB] = useState(false);

  // --- CALCULATE TARGET BUDGET ---
  const targetBudget = duration === 'Monthly' 
    ? (dbBudgetPeriod === 'Weekly' ? dbBudget * 4 : dbBudget) 
    : (dbBudgetPeriod === 'Monthly' ? dbBudget / 4 : dbBudget);

  // --- HELPER: SHOW TOAST ---
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000); 
  };

  // --- AUTH & DATA FETCHING ---
  useEffect(() => {
    const fetchUserData = async () => {
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (!user) {
          router.push('/login');
          return;
        }
        try {
          setUserId(user.uid);
          
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            if (data.budgetAmount) setDbBudget(Number(data.budgetAmount));
            if (data.budgetPeriod) setDbBudgetPeriod(data.budgetPeriod);
            if (data.allergies && Array.isArray(data.allergies)) setUserAllergies(data.allergies);
            
            if (data.pantry && Array.isArray(data.pantry)) {
               const pantryItems = data.pantry.map((item: any) => 
                 typeof item === 'string' ? item.toLowerCase().trim() : (item.name || '').toLowerCase().trim()
               );
               setUserPantry(pantryItems);
            }
          }

          try {
            const ingSnap = await getDocs(collection(db, 'market_ingredients'));
            const pricesMap: Record<string, number> = {};
            
            ingSnap.forEach(doc => {
              const data = doc.data();
              const cost = Number(data.unitPrice || data.UnitPrice || data.price || data.Price || data.estimatedCost || data.cost || data.Cost || 0);
              
              pricesMap[doc.id] = cost;
              const cleanId = doc.id.replace(/^ing_/, '').toLowerCase().trim();
              pricesMap[cleanId] = cost;
              
              if (data.name) {
                pricesMap[data.name.toLowerCase().trim()] = cost;
              }
            });
            
            setIngredientPrices(pricesMap);
          } catch (ingErr) {
            console.error("Could not fetch market_ingredients collection for pricing:", ingErr);
          }

        } catch (err) {
          console.error("Error fetching user profile:", err);
        } finally {
          setIsFetchingUser(false);
        }
      });
      return unsubscribe;
    };
    
    fetchUserData();
  }, [router]);

  const cloneDay = (dayData: any) => {
    if (!dayData) return { Breakfast: null, Lunch: null, Dinner: null };
    return {
      Breakfast: dayData.Breakfast ? { ...dayData.Breakfast } : null,
      Lunch: dayData.Lunch ? { ...dayData.Lunch } : null,
      Dinner: dayData.Dinner ? { ...dayData.Dinner } : null,
    };
  };

  const createEmptyWeek = (): WeekPlan => ({
    Mon: { Breakfast: null, Lunch: null, Dinner: null },
    Tue: { Breakfast: null, Lunch: null, Dinner: null },
    Wed: { Breakfast: null, Lunch: null, Dinner: null },
    Thu: { Breakfast: null, Lunch: null, Dinner: null },
    Fri: { Breakfast: null, Lunch: null, Dinner: null },
    Sat: { Breakfast: null, Lunch: null, Dinner: null },
    Sun: { Breakfast: null, Lunch: null, Dinner: null },
  });

  const updateManualShoppingList = (plan: Record<number, WeekPlan>, currentPantry: string[], currentPrices: Record<string, number>) => {
    const itemsMap = new Map<string, number>();
    
    Object.values(plan).forEach(week => {
      Object.values(week).forEach((day: any) => {
        if (!day) return;
        ['Breakfast', 'Lunch', 'Dinner'].forEach(type => {
          const meal = day[type];
          
          if (meal && meal.ingredients) {
            const ings = Array.isArray(meal.ingredients) ? meal.ingredients : [meal.ingredients];
            
            ings.forEach((ing: any) => {
              let rawName = typeof ing === 'string' ? ing : (ing.name || ing.ingredientId || 'Unknown Item');
              let cleanName = rawName.toLowerCase().replace(/^ing_/, '').replace(/_/g, ' ').trim();
              let displayName = cleanName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

              const exactId = typeof ing === 'object' && ing.ingredientId ? ing.ingredientId : null;
              const unitPrice = (exactId && currentPrices[exactId]) || currentPrices[rawName] || currentPrices[cleanName] || 0;
              const quantity = typeof ing === 'object' && ing.amount ? Number(ing.amount) : 1; 
              const itemCost = unitPrice * quantity;
              
              if (!currentPantry.includes(cleanName)) {
                itemsMap.set(displayName, (itemsMap.get(displayName) || 0) + itemCost);
              }
            });
          }
        });
      });
    });
    
    const newList = Array.from(itemsMap.entries()).map(([name, cost]) => ({ name, estimatedCost: cost }));
    setShoppingList(newList);
  };

  // --- ACTIONS ---
  const handleGenerate = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);
    setCurrentWeek(1);

    try {
      // --- 1. PRE-CALCULATE NEXT AVAILABLE MONDAY FROM DATABASE ---
      const plansRef = collection(db, 'users', userId, 'meal_plans');
      const q = query(plansRef, orderBy('endDate', 'desc'), limit(1));
      const snapshot = await getDocs(q);

      let baseDate = new Date();
      baseDate.setHours(0, 0, 0, 0);

      // If a plan already exists, queue this new one up after it ends
      if (!snapshot.empty) {
        const lastPlan = snapshot.docs[0].data();
        const lastEndDate = lastPlan.endDate.toDate();
        lastEndDate.setHours(0, 0, 0, 0);

        if (lastEndDate >= baseDate) {
          baseDate = new Date(lastEndDate);
          baseDate.setDate(baseDate.getDate() + 1); // Start the day after the last plan ends
        }
      }

      // Snap the target date to the next available Monday
      const currentDay = baseDate.getDay();
      if (currentDay !== 1) {
        const daysUntilMonday = currentDay === 0 ? 1 : 8 - currentDay;
        baseDate.setDate(baseDate.getDate() + daysUntilMonday);
      }

      const calculatedStart = new Date(baseDate);
      const calculatedEnd = new Date(calculatedStart);
      
      // FIXED MATH: A weekly plan starting Mon ends Sun (6 days). Monthly ends in 27 days.
      calculatedEnd.setDate(calculatedStart.getDate() + (duration === 'Monthly' ? 27 : 6));
      
      setPlanStartDate(calculatedStart);
      setPlanEndDate(calculatedEnd);

      // --- 2. GENERATE THE MEALS ---
      const weeksToGenerate = duration === 'Monthly' ? 4 : 1;

      if (mode === 'Manual') {
        const emptyPlan: Record<number, WeekPlan> = {};
        for (let i = 1; i <= weeksToGenerate; i++) {
          emptyPlan[i] = createEmptyWeek();
        }
        setGeneratedPlan(emptyPlan);
        setTotalSpent(0);
        setShoppingList([]);
        
        setStep(2);
        setLoading(false);
        return;
      }

      const res = await fetch('/api/recommend-meals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          budgetGoal: targetBudget, 
          uid: userId, 
          allergies: userAllergies 
        })
      });
      
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to fetch recommendations.');

      const { weekPlan, missingIngredients } = distributeMeals(data.results, targetBudget, duration);
      
      const newPlan: Record<number, WeekPlan> = {};
      let spent = 0;

      if (duration === 'Monthly') {
        for (let w = 1; w <= 4; w++) {
          newPlan[w] = {
            Mon: cloneDay((weekPlan as any)[`W${w} Mon`]),
            Tue: cloneDay((weekPlan as any)[`W${w} Tue`]),
            Wed: cloneDay((weekPlan as any)[`W${w} Wed`]),
            Thu: cloneDay((weekPlan as any)[`W${w} Thu`]),
            Fri: cloneDay((weekPlan as any)[`W${w} Fri`]),
            Sat: cloneDay((weekPlan as any)[`W${w} Sat`]),
            Sun: cloneDay((weekPlan as any)[`W${w} Sun`]),
          };
        }
      } else {
        newPlan[1] = {
          Mon: cloneDay(weekPlan.Mon),
          Tue: cloneDay(weekPlan.Tue),
          Wed: cloneDay(weekPlan.Wed),
          Thu: cloneDay(weekPlan.Thu),
          Fri: cloneDay(weekPlan.Fri),
          Sat: cloneDay(weekPlan.Sat),
          Sun: cloneDay(weekPlan.Sun),
        };
      }

      Object.values(newPlan).forEach(week => {
        Object.values(week).forEach((day: any) => {
          if (day.Breakfast) spent += day.Breakfast.cost;
          if (day.Lunch) spent += day.Lunch.cost;
          if (day.Dinner) spent += day.Dinner.cost;
        });
      });

      setTotalSpent(spent);
      setGeneratedPlan(newPlan);
      setShoppingList(missingIngredients);
      setStep(2); 

    } catch (err: any) {
      console.error(err);
      showToast('error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = async () => {
    // Rely strictly on the state values so the UI and DB match perfectly
    if (!userId || !generatedPlan || !planStartDate || !planEndDate) return;
    setIsSaving(true);

    try {
      const plansRef = collection(db, 'users', userId, 'meal_plans');

      const planDocRef = await addDoc(plansRef, {
        createdAt: serverTimestamp(),
        startDate: planStartDate,
        endDate: planEndDate,
        duration: duration,
        targetBudget: targetBudget,
        totalEstimatedCost: totalSpent,
        schedule: generatedPlan,
      });

      if (shoppingList && shoppingList.length > 0) {
        const groceryRef = collection(db, 'users', userId, 'grocery_lists');
        
        const formattedItems = shoppingList.map(item => ({
          name: item.name,
          estimatedCost: item.estimatedCost,
          isBought: false 
        }));

        await addDoc(groceryRef, {
          mealPlanId: planDocRef.id,
          createdAt: serverTimestamp(),
          startDate: planStartDate,
          endDate: planEndDate,
          items: formattedItems,
          totalEstimatedCost: formattedItems.reduce((sum, item) => sum + item.estimatedCost, 0),
          status: 'active'
        });
      }

      showToast('success', `Plan saved! Scheduled to start on ${planStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.`);

      setTimeout(() => {
        router.push('/dashboard'); 
      }, 2000);

    } catch (err) {
      console.error("Error saving plan:", err);
      showToast('error', 'Failed to save the plan. Please check your permissions and try again.');
      setIsSaving(false); 
    } 
  };

  const resetPlanner = () => {
    setStep(1);
    setGeneratedPlan(null);
    setShoppingList([]);
    setTotalSpent(0);
    setCurrentWeek(1);
    setPlanStartDate(null);
    setPlanEndDate(null);
  };

  // --- MANUAL EDITING FUNCTIONS ---
  const openModal = async (day: keyof WeekPlan, type: 'Breakfast' | 'Lunch' | 'Dinner') => {
    setActiveDay(day);
    setActiveMealType(type);
    setIsModalOpen(true);
    
    if (availableMeals.length === 0) {
      setIsSearchingDB(true);
      try {
        const items: DatabaseItem[] = [];
        const recipesSnap = await getDocs(collection(db, 'recipes'));
        recipesSnap.forEach(doc => {
          items.push({ 
            id: doc.id, 
            title: doc.data().title, 
            source: 'Recipe', 
            cost: doc.data().estimatedCost || 0, 
            image: doc.data().image,
            ingredients: doc.data().ingredientsNeeded || [] 
          });
        });
        const cafeSnap = await getDocs(collection(db, 'cafeteria_meals'));
        cafeSnap.forEach(doc => {
          items.push({ 
            id: doc.id, 
            title: doc.data().name, 
            source: 'Cafeteria', 
            cost: doc.data().price || 0, 
            image: doc.data().image,
            ingredients: [] 
          });
        });
        setAvailableMeals(items);
      } catch (err) {
        console.error("Error fetching database", err);
      } finally {
        setIsSearchingDB(false);
      }
    }
  };

  const handleSelectMeal = (item: DatabaseItem) => {
    if (!generatedPlan) return;
    
    const updatedPlan = { ...generatedPlan };
    const updatedWeek = { ...updatedPlan[currentWeek] };
    const updatedDay = { ...updatedWeek[activeDay] };
    
    const existingMeal = updatedDay[activeMealType] as any;
    const costDifference = item.cost - (existingMeal ? existingMeal.cost : 0);

    updatedDay[activeMealType] = { 
        name: item.title, 
        cost: item.cost, 
        source: item.source,
        ingredients: item.ingredients || []
    } as any;
    
    updatedWeek[activeDay] = updatedDay as any;
    updatedPlan[currentWeek] = updatedWeek;
    
    setGeneratedPlan(updatedPlan);
    setTotalSpent(prev => prev + costDifference); 
    setIsModalOpen(false);
    setSearchQuery('');

    if (mode === 'Manual') {
      updateManualShoppingList(updatedPlan, userPantry, ingredientPrices);
    }
  };

  const handleRemoveMeal = (day: keyof WeekPlan, type: 'Breakfast' | 'Lunch' | 'Dinner') => {
    if (!generatedPlan) return;
    
    const meal = generatedPlan[currentWeek]?.[day]?.[type] as any;
    if (!meal) return;

    const updatedPlan = { ...generatedPlan };
    const updatedWeek = { ...updatedPlan[currentWeek] };
    const updatedDay = { ...updatedWeek[day] };
    
    updatedDay[type] = null as any;
    updatedWeek[day] = updatedDay as any;
    updatedPlan[currentWeek] = updatedWeek;
    
    setGeneratedPlan(updatedPlan);
    setTotalSpent(prev => prev - meal.cost);

    if (mode === 'Manual') {
      updateManualShoppingList(updatedPlan, userPantry, ingredientPrices);
    }
  };

  const filteredMeals = availableMeals.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const daysOfWeek: (keyof WeekPlan)[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  if (isFetchingUser) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#1CD05D] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pb-20 lg:pb-8 relative">
      
      {/* --- CUSTOM TOAST NOTIFICATION --- */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-5 fade-in duration-300 ${
          toast.type === 'success' ? 'bg-[#13251A] border border-[#1CD05D] text-[#1CD05D]' : 'bg-red-950 border border-red-500 text-red-400'
        }`}>
          {toast.type === 'success' ? (
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          ) : (
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          )}
          <p className="text-sm font-bold">{toast.message}</p>
          <button onClick={() => setToast(null)} className="ml-4 opacity-50 hover:opacity-100 transition-opacity">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      <main className="p-6 md:p-8 max-w-[1000px] mx-auto w-full animate-in fade-in duration-500">
        
        {/* STEP 1: SETUP */}
        {step === 1 && (
          <div className="space-y-6 mt-2">
            <div className="mb-8">
              <p className="text-[#1CD05D] text-[10px] font-bold tracking-[0.15em] uppercase mb-2">Meal Planning Strategy</p>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Setup Your Meal Plan</h1>
              <p className="text-gray-400 text-sm max-w-xl leading-relaxed">
                Define how you want to build your upcoming meal cycle. Our engine considers your budget, dietary preferences, and existing pantry stock.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Auto Generate Card */}
              <div 
                onClick={() => setMode('Auto')} 
                className={`relative overflow-hidden cursor-pointer rounded-2xl p-6 transition-all duration-300 border ${mode === 'Auto' ? 'border-[#1CD05D] bg-[#111111]' : 'border-[#2A2A2A] bg-[#111111] hover:border-gray-600'}`}
              >
                {mode === 'Auto' && (
                  <svg className="absolute bottom-4 right-4 w-32 h-32 text-[#1CD05D] opacity-[0.08] transform rotate-12 pointer-events-none" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                )}
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-5 transition-colors ${mode === 'Auto' ? 'bg-[#1CD05D]/10 text-[#1CD05D]' : 'bg-[#1A1A1A] text-gray-500'}`}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5z"/></svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">AI Auto-Generate</h3>
                  <p className="text-sm text-gray-400 leading-relaxed mb-8">
                    Let our algorithm optimize for your budget and pantry. We'll curate a balanced schedule of recipes that minimize waste and maximize savings.
                  </p>
                  <div className="mt-auto">
                    <p className={`text-xs font-bold transition-colors flex items-center gap-1 ${mode === 'Auto' ? 'text-[#1CD05D]' : 'text-gray-500'}`}>
                      Select Mode &rarr;
                    </p>
                  </div>
                </div>
              </div>

              {/* Manual Card */}
              <div 
                onClick={() => setMode('Manual')} 
                className={`relative overflow-hidden cursor-pointer rounded-2xl p-6 transition-all duration-300 border ${mode === 'Manual' ? 'border-[#1CD05D] bg-[#111111]' : 'border-[#2A2A2A] bg-[#111111] hover:border-gray-600'}`}
              >
                <div className="relative z-10 flex flex-col h-full">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-5 transition-colors ${mode === 'Manual' ? 'bg-[#1CD05D]/10 text-[#1CD05D]' : 'bg-[#1A1A1A] text-gray-500'}`}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 11.24V7.5C9 6.12 10.12 5 11.5 5S14 6.12 14 7.5v3.74c1.21-.81 2-2.18 2-3.74C16 5.01 13.99 3 11.5 3S7 5.01 7 7.5c0 1.56.79 2.93 2 3.74zm9.84 4.63l-4.54-2.26c-.17-.07-.35-.11-.54-.11H13v-6C13 6.67 12.33 6 11.5 6S10 6.67 10 7.5v10.74l-3.43-.72c-.08-.01-.15-.03-.24-.03-.31 0-.59.13-.79.33l-.79.8 4.94 4.94c.27.27.65.44 1.06.44h6.79c.75 0 1.33-.55 1.44-1.28l.75-5.27c.01-.07.02-.14.02-.2 0-.62-.38-1.16-.91-1.38z"/></svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Build Manually</h3>
                  <p className={`text-sm leading-relaxed mb-8 ${mode === 'Manual' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Hand-pick your favorite recipes. Browse our full library and assemble your own schedule day by day with total creative control.
                  </p>
                  <div className="mt-auto">
                    <p className={`text-xs font-bold transition-colors flex items-center gap-1 ${mode === 'Manual' ? 'text-[#1CD05D]' : 'text-gray-500'}`}>
                      Select Mode &rarr;
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Duration Selector Bar */}
            <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6 flex items-center justify-between mt-6">
              <div>
                <h3 className="text-sm font-bold text-white mb-0.5">Planning Duration</h3>
                <p className="text-xs text-gray-500">How long of a period should this plan cover?</p>
              </div>
              <div className="bg-[#1A1A1A] p-1 rounded-full flex border border-[#2A2A2A]">
                <button onClick={() => setDuration('Weekly')} className={`px-6 py-2 rounded-full text-xs font-bold transition-colors ${duration === 'Weekly' ? 'bg-[#1CD05D] text-black' : 'text-gray-400 hover:text-white'}`}>Weekly</button>
                <button onClick={() => setDuration('Monthly')} className={`px-6 py-2 rounded-full text-xs font-bold transition-colors ${duration === 'Monthly' ? 'bg-[#1CD05D] text-black' : 'text-gray-400 hover:text-white'}`}>Monthly</button>
              </div>
            </div>

            {/* Generate Button */}
            <div className="pt-6 flex justify-center">
              <button onClick={handleGenerate} disabled={loading} className="w-[300px] py-3.5 rounded-xl font-bold text-sm text-gray-900 bg-[#1CD05D] hover:bg-[#15b04d] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {loading ? <><div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>Processing...</> : <>
                  Generate Meal Plan
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M7.5 5.6L5 7l1.4-2.5L5 2l2.5 1.4L10 2 8.6 4.5 10 7 7.5 5.6zm12 9.8l-2.5 1.4 1.4-2.5L17 11.8l2.5 1.4L22 11.8l-1.4 2.5 1.4 2.5-2.5-1.4zM22 2l-2.5 1.4L18.1 2l1.4 2.5-1.4 2.5 2.5-1.4L23.1 7l-1.4-2.5L23.1 2zM3.4 22L1.9 20.6l15.6-15.6 1.5 1.5L3.4 22z"/></svg>
                </>}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: DASHBOARD VIEW */}
        {step === 2 && generatedPlan && (
          <div className="space-y-8 animate-in fade-in duration-500 max-w-[1200px] mx-auto">
            
            <div className="flex flex-col mb-2">
              <div className="flex justify-between items-center mb-1">
                <h2 className="text-2xl font-bold text-white">
                  {mode === 'Auto' ? 'Your Generated Plan' : 'Manual Plan Builder'}
                </h2>
                <button onClick={resetPlanner} className="text-xs font-bold text-[#1CD05D] hover:underline">
                  Edit Plan Settings
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-[#111111] border border-[#2A2A2A] rounded-2xl">
                <div className="flex justify-between items-start mb-3">
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {totalSpent > targetBudget ? (
                    <span className="px-2 py-1 text-[10px] font-bold text-red-400 bg-red-950/30 rounded uppercase tracking-wider">Over Budget</span>
                  ) : (
                    <span className="px-2 py-1 text-[10px] font-bold text-[#1CD05D] bg-[#13251A] rounded uppercase tracking-wider">On Budget</span>
                  )}
                </div>
                <div className="flex items-end gap-2">
                  <p className="text-2xl font-bold text-white">₦{totalSpent.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mb-1">/ ₦{targetBudget.toLocaleString()}</p>
                </div>
                <div className="w-full h-1.5 mt-3 bg-[#2A2A2A] rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${totalSpent > targetBudget ? 'bg-red-500' : 'bg-[#1CD05D]'}`} style={{ width: `${Math.min((totalSpent / targetBudget) * 100, 100)}%` }}></div>
                </div>
              </div>
              
              {/* Date Card */}
              {planStartDate && planEndDate && (
                <div className="p-5 bg-[#111111] border border-[#2A2A2A] rounded-2xl flex flex-col justify-center">
                  <svg className="w-6 h-6 text-gray-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <p className="text-xl font-bold text-white mb-1">
                    {planStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {planEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-xs font-bold tracking-widest text-gray-500 uppercase">{duration} Cycle</p>
                </div>
              )}
            </div>

            {/* MONTHLY TABS */}
            {duration === 'Monthly' && (
              <div className="flex gap-2 overflow-x-auto scrollbar-hide py-2">
                {[1, 2, 3, 4].map(w => (
                  <button
                    key={w}
                    onClick={() => setCurrentWeek(w)}
                    className={`px-6 py-2 rounded-xl text-xs font-bold transition-all duration-300 whitespace-nowrap ${
                      currentWeek === w 
                        ? 'bg-[#1CD05D] text-gray-900' 
                        : 'bg-[#111111] text-gray-400 border border-[#2A2A2A] hover:border-gray-500 hover:text-white'
                    }`}
                  >
                    Week {w}
                  </button>
                ))}
              </div>
            )}

            {/* Weekly Calendar Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
              {daysOfWeek.map(day => {
                const dayData = generatedPlan[currentWeek][day];
                return (
                  <div key={day} className="bg-[#111111] rounded-2xl border border-[#2A2A2A] flex flex-col">
                    <div className="text-center py-2.5 border-b border-[#2A2A2A]">
                      <span className="text-[#1CD05D] text-xs font-bold uppercase tracking-widest">{day}</span>
                    </div>
                    <div className="p-3 space-y-3 grow flex flex-col">
                      
                      {(['Breakfast', 'Lunch', 'Dinner'] as const).map(type => {
                        const meal = dayData?.[type];
                        return (
                          <div key={type} className="flex-1 flex flex-col">
                            <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">{type}</span>
                            {meal ? (
                              <div className="bg-[#1A1A1A] p-3 rounded-xl border border-[#2A2A2A] group relative flex flex-col justify-center min-h-[70px]">
                                <button onClick={() => handleRemoveMeal(day, type)} className="absolute -top-2 -right-2 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all bg-[#111111] border border-[#2A2A2A] rounded-full p-1 z-20 shadow-lg">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                                
                                <div onClick={() => openModal(day, type)} className="cursor-pointer relative group/tooltip w-full h-full flex flex-col justify-between">
                                  <p className="font-bold text-white text-sm truncate mb-1 pr-1">{meal.name || (meal as any).title}</p>
                                  
                                  <div className="absolute z-50 left-1/2 bottom-full mb-2 -translate-x-1/2 hidden group-hover/tooltip:block w-max max-w-[220px] bg-[#1CD05D] text-gray-900 text-xs font-bold py-1.5 px-3 rounded shadow-xl whitespace-normal text-center pointer-events-none">
                                    {meal.name || (meal as any).title}
                                    <div className="absolute top-full left-1/2 w-2 h-2 bg-[#1CD05D] transform -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
                                  </div>

                                  <p className="text-[10px] font-bold text-gray-500 flex items-center justify-between">
                                    <span className={`${meal.source === 'Recipe' ? 'text-[#1CD05D]' : 'text-blue-400'} uppercase tracking-wider`}>{meal.source}</span>
                                    <span>₦{meal.cost}</span>
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div onClick={() => openModal(day, type)} className="border border-dashed border-[#2A2A2A] rounded-xl flex items-center justify-center min-h-[70px] hover:border-[#1CD05D] hover:bg-[#1CD05D]/5 cursor-pointer transition-colors group">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 group-hover:text-[#1CD05D] flex items-center gap-1">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg> Add
                                </span>
                              </div>
                            )}
                          </div>
                        )
                      })}

                    </div>
                  </div>
                );
              })}
            </div>

            {/* Shopping List Integration */}
            <div className="mt-8 flex flex-col md:flex-row gap-6">
              
              {/* Left Side: Grocery Items */}
              <div className="flex-1 bg-[#111111] border border-[#2A2A2A] p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-[#1A1A1A] flex items-center justify-center text-[#1CD05D]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Grocery Needs</h2>
                    <p className="text-gray-500 text-xs">Ingredients required for your scheduled recipes.</p>
                  </div>
                </div>

                {shoppingList.length === 0 ? (
                  <div className="p-8 border border-dashed border-[#2A2A2A] rounded-xl text-center">
                    <p className="text-gray-400 text-sm font-bold">No ingredients required</p>
                    <p className="text-gray-600 text-xs mt-1">Your pantry covers it, or you're eating at the cafe.</p>
                  </div>
                ) : (
                  <ul className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                    {shoppingList.map((item, idx) => (
                      <li key={idx} className="bg-[#1A1A1A] px-4 py-3 rounded-xl flex justify-between items-center border border-[#2A2A2A]">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-[#1CD05D] shrink-0"></div>
                          <span className="font-bold text-white text-sm truncate">{item.name}</span>
                        </div>
                        <span className="text-[#1CD05D] font-bold text-sm shrink-0">
                          {item.estimatedCost > 0 ? `₦${item.estimatedCost.toLocaleString()}` : <span className="text-gray-500 text-xs">Price TBD</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Right Side: Action Card */}
              <div className="md:w-72 bg-[#111111] border border-[#2A2A2A] p-6 rounded-2xl flex flex-col justify-center items-center text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-[#1CD05D]/5 to-transparent"></div>
                <div className="relative z-10 w-full">
                  <h3 className="text-lg font-bold text-white mb-2">Ready to commit?</h3>
                  <p className="text-xs text-gray-400 mb-6">Saving this plan will sync it to your dashboard and finalize your grocery list.</p>
                  <button 
                    onClick={handleSavePlan}
                    disabled={isSaving}
                    className="w-full bg-[#1CD05D] text-gray-900 px-6 py-3.5 rounded-xl text-sm font-bold hover:bg-[#15b04d] transition-all duration-300 disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Plan to Dashboard'}
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}
      </main>

      {/* --- ADD MEAL MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#111111] border border-[#2A2A2A] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-[#2A2A2A] flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white mb-0.5">Select a Meal</h2>
                <p className="text-[10px] font-bold tracking-widest text-[#1CD05D] uppercase">Week {currentWeek} • {activeDay} {activeMealType}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-white bg-[#1A1A1A] rounded-full">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-4 border-b border-[#2A2A2A] bg-[#1A1A1A]/50 relative">
               <div className="absolute inset-y-0 left-0 flex items-center pl-7 pointer-events-none text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search recipes or cafeteria meals..." className="w-full py-3 pl-10 pr-4 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-white text-sm focus:border-[#1CD05D] outline-none" />
            </div>

            <div className="overflow-y-auto p-4 flex-1 bg-[#0A0A0A]">
              {isSearchingDB ? (
                <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-[#1CD05D] border-t-transparent rounded-full animate-spin"></div></div>
              ) : filteredMeals.length === 0 ? (
                <div className="text-center py-10 text-gray-500 text-sm">No meals found.</div>
              ) : (
                <div className="space-y-2">
                  {filteredMeals.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-[#111111] border border-[#2A2A2A] rounded-xl hover:border-gray-500 transition-colors">
                      <div className="flex items-center gap-3 overflow-hidden">
                        {item.image ? (
                          <div className="w-12 h-12 rounded-lg overflow-hidden relative shrink-0"><Image src={item.image} alt={item.title} fill className="object-cover" /></div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-[#1A1A1A] flex items-center justify-center text-gray-600 shrink-0"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-white text-sm truncate" title={item.title}>{item.title}</p>
                          <p className="text-[10px] uppercase font-bold text-gray-500 mt-0.5">{item.source} • ₦{item.cost}</p>
                        </div>
                      </div>
                      <button onClick={() => handleSelectMeal(item)} className="ml-3 px-4 py-2 text-xs font-bold text-gray-900 bg-[#1CD05D] hover:bg-[#15b04d] rounded-lg shrink-0">Add</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}