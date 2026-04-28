// app/api/recommend-meals/route.ts
import { NextResponse } from 'next/server';
import { getAHPWeights, runTOPSIS, MealOption } from '@/lib/mcdm';
import { adminDb } from '@/lib/firebase-admin';

const AVERAGE_CAFETERIA_WAIT_TIME = 15; 
const CAFETERIA_EFFORT_SCORE = 1; 
const CAFETERIA_PANTRY_MATCH = 1.0; 

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { budgetGoal = 5000, uid, allergies = [] } = body;

    if (!uid) return NextResponse.json({ error: 'User UID is required' }, { status: 400 });

    // Normalize allergies to lowercase for easy matching
    const userAllergies = allergies.map((a: string) => a.toLowerCase().trim());

    const [cafeteriaSnap, recipesSnap, marketSnap, pantrySnap] = await Promise.all([
      adminDb.collection('cafeteria_meals').get(),
      adminDb.collection('recipes').get(),
      adminDb.collection('market_ingredients').get(),
      adminDb.collection('users').doc(uid).collection('pantry').get()
    ]);

    const marketPrices: Record<string, number> = {};
    const ingredientNames: Record<string, string> = {}; // <-- NEW: For allergy checking
    
    marketSnap.forEach(doc => { 
      const data = doc.data();
      marketPrices[doc.id] = data.unitPrice || 0; 
      ingredientNames[doc.id] = (data.name || '').toLowerCase();
    });

    const userPantry: Record<string, boolean> = {};
    pantrySnap.forEach(doc => {
      const data = doc.data();
      const ingId = data.ingredientId?.id || data.ingredientId || doc.id; 
      userPantry[ingId] = true; 
    });

    // --- 1. PROCESS CAFETERIA MEALS (With Allergy Check) ---
    const cafeteriaMeals: MealOption[] = cafeteriaSnap.docs.reduce((acc: MealOption[], doc) => {
      const data = doc.data();
      const mealAllergens = (data.allergens || []).map((a: string) => a.toLowerCase());
      
      // HARD CONSTRAINT: Does this meal contain a user allergy?
      const hasAllergy = userAllergies.some((allergy: string) => mealAllergens.includes(allergy));

      if (data.isAvailable !== false && !hasAllergy) {
        acc.push({
          id: doc.id,
          name: data.name,
          cost: data.price || 0,
          time: AVERAGE_CAFETERIA_WAIT_TIME,
          effort: CAFETERIA_EFFORT_SCORE,
          pantryMatch: CAFETERIA_PANTRY_MATCH,
          source: 'Cafeteria'
        });
      }
      return acc;
    }, []);

// --- 2. PROCESS RECIPES (With Allergy Check) ---
    const recipeMeals: MealOption[] = recipesSnap.docs.reduce((acc: MealOption[], doc) => {
      const data = doc.data();
      const ingredientsNeeded = data.ingredientsNeeded || [];
      const instructions = data.instructions || [];

      let totalCost = 0;
      let ownedCount = 0;
      let hasAllergy = false;
      
      // NEW: Array to hold exactly what is missing
      const missingItems: { name: string, cost: number }[] = []; 

      ingredientsNeeded.forEach((ing: any) => {
        const ingId = ing.ingredientId?.id || ing.ingredientId;
        const ingCost = marketPrices[ingId] || 0;
        
        totalCost += ingCost; 

        // Check pantry status
        if (userPantry[ingId]) {
          ownedCount++;
        } else {
          // If not in pantry, add it to our specific missing items list!
          // We use a fallback just in case the name isn't found
          missingItems.push({
            name: ingredientNames[ingId] || 'Unknown Ingredient',
            cost: ingCost
          });
        }

        // HARD CONSTRAINT: Check allergies
        const ingName = ingredientNames[ingId] || '';
        if (userAllergies.some((allergy: string) => ingName.includes(allergy))) {
          hasAllergy = true;
        }
      });

      if (!hasAllergy) {
        acc.push({
          id: doc.id,
          name: data.title || data.name,
          cost: totalCost,
          time: data.time || 30,
          effort: instructions.length > 0 ? instructions.length : 3,
          pantryMatch: ingredientsNeeded.length > 0 ? ownedCount / ingredientsNeeded.length : 1.0,
          source: 'Recipe',
          missingItems: missingItems // NEW: Attach to the meal data!
        } as any); // Using 'as any' temporarily so TS doesn't complain about the new field
      }
      return acc;
    }, []);

    const allMeals = [...cafeteriaMeals, ...recipeMeals];
    const affordableMeals = allMeals.filter(meal => meal.cost <= budgetGoal);
    const weights = getAHPWeights();
    const rankedMeals = runTOPSIS(affordableMeals, weights);

    return NextResponse.json({ success: true, results: rankedMeals });
  } catch (error) {
    console.error("Backend Recommendation Error:", error);
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 });
  }
}