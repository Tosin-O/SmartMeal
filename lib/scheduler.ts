// lib/scheduler.ts
import { MealOption } from './mcdm';

// --- TYPES ---
export type WeekPlan = {
  [day: string]: {
    Breakfast?: MealOption;
    Lunch?: MealOption;
    Dinner?: MealOption;
  }
};

export type MissingIngredient = {
  name: string;
  estimatedCost: number;
};

// --- CORE SCHEDULING ENGINE ---
export function distributeMeals(
  rankedMeals: (MealOption & { score: number })[], 
  maxBudget: number, 
  duration: string
): { weekPlan: WeekPlan, missingIngredients: MissingIngredient[] } {
  
  // 1. DYNAMIC DURATION SETUP
  const numDays = duration === 'Monthly' ? 28 : 7;
  const totalMealsToPlan = numDays * 3;
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const slots = ['Breakfast', 'Lunch', 'Dinner'];
  
  // 2. INITIALIZE STATE
  const weekPlan: WeekPlan = {};
  const missingIngredients: MissingIngredient[] = [];
  let remainingBudget = maxBudget;
  let mealsPlannedCount = 0; // Tracks successful assignments for dynamic math
  
  // 3. VARIETY TRACKERS
  const usageCount: Record<string, number> = {};
  const MAX_USAGE = duration === 'Monthly' ? 6 : 2; // Allow more repeats over a full month
  let recentMeals: string[] = []; // Tracks recent meals to enforce a cooldown period
  let lastSource = ''; // Tracks if the last meal was cooked or bought

  // --- THE SCHEDULING LOOP ---
  for (let i = 0; i < numDays; i++) {
    // Generate intelligent labels (e.g., "W1 Mon" for monthly plans)
    const dayLabel = duration === 'Monthly' 
      ? `W${Math.floor(i / 7) + 1} ${dayNames[i % 7]}` 
      : dayNames[i];

    weekPlan[dayLabel] = {};
    
    slots.forEach(slot => {
      // --- DYNAMIC BELT-TIGHTENING ---
      // Recalculate what we can afford based on exact remaining funds and slots
      const remainingMealsToPlan = totalMealsToPlan - mealsPlannedCount;
      const dynamicAverage = remainingBudget / (remainingMealsToPlan || 1);
      
      // Allow splurging up to 2x the current dynamic average.
      // If we splurge, dynamicAverage drops for the next slot, forcing a cheap meal recovery.
      const currentMaxCost = dynamicAverage * 2.0;

      // Filter 1: Must be affordable AND not violate the dynamic pacing guardrail
      let affordableMeals = rankedMeals.filter(m => 
        m.cost <= remainingBudget && 
        m.cost <= currentMaxCost 
      );

      // Fallback: If we can't afford 'nice' meals under the guardrail, 
      // drop the guardrail and just find the absolute cheapest things we can afford.
      if (affordableMeals.length === 0) {
        affordableMeals = rankedMeals.filter(m => m.cost <= remainingBudget);
      }

      if (affordableMeals.length === 0) return; // Wallet is officially at ₦0

      // Filter 2: Apply strict variety rules (Cap usage and check cooldowns)
      let idealMeals = affordableMeals.filter(meal => 
        (usageCount[meal.id] || 0) < MAX_USAGE && 
        !recentMeals.includes(meal.id)
      );

      // Filter 3: Try to alternate between Cafeteria and Recipe if possible
      let sourceFiltered = idealMeals.filter(meal => meal.source !== lastSource);
      
      // Filter 4: THE TOP-K RANDOMIZER
      // Pick randomly from the top 3 best available options so the plan feels fresh every time
      const bestOptions = sourceFiltered.length > 0 ? sourceFiltered : (idealMeals.length > 0 ? idealMeals : affordableMeals);
      const topK = bestOptions.slice(0, 3);
      let mealChoice = topK[Math.floor(Math.random() * topK.length)];

      // --- ASSIGN MEAL AND UPDATE STATE ---
      if (mealChoice) {
        weekPlan[dayLabel][slot] = mealChoice;
        remainingBudget -= mealChoice.cost;
        lastSource = mealChoice.source;
        mealsPlannedCount++;

        // Update variety trackers
        usageCount[mealChoice.id] = (usageCount[mealChoice.id] || 0) + 1;
        recentMeals.push(mealChoice.id);
        if (recentMeals.length > 5) recentMeals.shift(); // Keep only the last 5 meals in the cooldown memory

        // --- Handle shopping list for recipes (UPDATED) ---
        if (mealChoice.source === 'Recipe' && mealChoice.missingItems) {
          
          mealChoice.missingItems.forEach(missingItem => {
            // Title Case the ingredient name so it looks nice on the UI
            const formattedName = missingItem.name.charAt(0).toUpperCase() + missingItem.name.slice(1);
            
            // Check if we already have this exact ingredient in our master cart
            const existingItem = missingIngredients.find(item => item.name === formattedName);
            
            if (existingItem) {
              // If we already need it for another recipe, just aggregate the cost!
              existingItem.estimatedCost += missingItem.cost;
            } else {
              // Otherwise, add it as a brand new line item
              missingIngredients.push({
                name: formattedName,
                estimatedCost: missingItem.cost
              });
            }
          });
        }
      }
    });
  }

  return { weekPlan, missingIngredients };
}