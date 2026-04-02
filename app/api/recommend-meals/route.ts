// app/api/recommend-meals/route.ts
import { NextResponse } from 'next/server';
import { getAHPWeights, runTOPSIS, MealOption } from '@/lib/mcdm';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // <--- ADJUST THIS IMPORT TO YOUR FIREBASE FILE

const AVERAGE_CAFETERIA_WAIT_TIME = 15; 
const CAFETERIA_EFFORT_SCORE = 1; 
const CAFETERIA_PANTRY_MATCH = 1.0; 

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { budgetGoal = 5000, uid } = body;

    // We must have a UID to check their specific pantry
    if (!uid) {
      return NextResponse.json({ error: 'User UID is required to generate recommendations' }, { status: 400 });
    }

    // --- 1. FETCH ALL REQUIRED DATA CONCURRENTLY ---
    const [cafeteriaSnap, recipesSnap, marketSnap, pantrySnap] = await Promise.all([
      getDocs(collection(db, 'cafeteria_meals')),
      getDocs(collection(db, 'recipes')),
      getDocs(collection(db, 'market_ingredients')),
      getDocs(collection(db, 'users', uid, 'pantry'))
    ]);

    // --- 2. BUILD LOOKUP DICTIONARIES ---
    
    // Map market prices for quick lookup (IngredientID -> Price)
    const marketPrices: Record<string, number> = {};
    marketSnap.forEach(doc => {
      marketPrices[doc.id] = doc.data().unitPrice || 0;
    });

    // Map user's pantry for quick lookup (IngredientID -> boolean)
    // For now, we just care IF they have it. Later you can check quantities.
    const userPantry: Record<string, boolean> = {};
    pantrySnap.forEach(doc => {
      // Your schema uses ingredientId as a reference, adjust if it's a string
      const data = doc.data();
      const ingId = data.ingredientId?.id || data.ingredientId || doc.id; 
      userPantry[ingId] = true; 
    });


    // --- 3. PROCESS CAFETERIA MEALS ---
    const cafeteriaMeals: MealOption[] = cafeteriaSnap.docs
      .map(doc => {
        const data = doc.data();
        // Only include meals marked as available
        if (data.isAvailable === false) return null; 

        return {
          id: doc.id,
          name: data.name,
          cost: data.price,
          time: AVERAGE_CAFETERIA_WAIT_TIME,
          effort: CAFETERIA_EFFORT_SCORE,
          pantryMatch: CAFETERIA_PANTRY_MATCH,
          source: 'Cafeteria' as const
        };
      })
      .filter((meal): meal is MealOption => meal !== null); // Remove nulls


    // --- 4. PROCESS RECIPES ---
    const recipeMeals: MealOption[] = recipesSnap.docs.map(doc => {
      const data = doc.data();
      const ingredientsNeeded = data.ingredientsNeeded || [];
      const instructions = data.instructions || [];

      // A. Calculate Cost: Sum the cost of all required ingredients
      // Note: This assumes base unit matches. You might need math here later for grams/kg.
      let totalCost = 0;
      ingredientsNeeded.forEach((ing: any) => {
        const ingId = ing.ingredientId?.id || ing.ingredientId;
        const price = marketPrices[ingId] || 0;
        // Simplified: assuming price is per unit needed. 
        totalCost += price; 
      });

      // B. Calculate Effort: Number of steps
      const effortScore = instructions.length > 0 ? instructions.length : 3; // Fallback to 3 if empty

      // C. Calculate Pantry Match %
      let ownedCount = 0;
      ingredientsNeeded.forEach((ing: any) => {
        const ingId = ing.ingredientId?.id || ing.ingredientId;
        if (userPantry[ingId]) ownedCount++;
      });
      const matchPercentage = ingredientsNeeded.length > 0 
        ? ownedCount / ingredientsNeeded.length 
        : 1.0; // If no ingredients needed, it's a 100% match

      return {
        id: doc.id,
        name: data.title,
        cost: totalCost,
        time: data.time || 30, // Fallback if your DB doesn't have time yet
        effort: effortScore,
        pantryMatch: matchPercentage,
        source: 'Recipe' as const
      };
    });

    // --- 5. ALGORITHM PIPELINE ---
    const allMeals = [...cafeteriaMeals, ...recipeMeals];

    // Filter by budget
    const affordableMeals = allMeals.filter(meal => meal.cost <= budgetGoal);

    // Run AHP-TOPSIS
    const weights = getAHPWeights();
    const rankedMeals = runTOPSIS(affordableMeals, weights);

    return NextResponse.json({
      success: true,
      stats: {
        totalMealsEvaluated: affordableMeals.length,
        cafeteriaMeals: cafeteriaMeals.length,
        recipeMeals: recipeMeals.length
      },
      appliedWeights: { 
        cost: Number(weights[0].toFixed(3)), 
        time: Number(weights[1].toFixed(3)), 
        effort: Number(weights[2].toFixed(3)),
        pantryMatch: Number(weights[3].toFixed(3))
      },
      results: rankedMeals
    });

  } catch (error) {
    console.error("Recommendation Error:", error);
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 });
  }
}