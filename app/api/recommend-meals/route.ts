// app/api/recommend-meals/route.ts
import { NextResponse } from 'next/server';
import { getAHPWeights, runTOPSIS, MealOption } from '@/lib/mcdm';
// import { db } from '@/lib/firebase'; // Adjust to your actual firebase config path
// import { collection, getDocs } from 'firebase/firestore'; 

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userBudgetGoal = body.budgetGoal || 5000; // Default fallback

    // --- FIREBASE FETCH START ---
    // In production, uncomment and use your Firebase instance:
    /*
    const cafeteriaRef = collection(db, 'cafeteria_meals');
    const snapshot = await getDocs(cafeteriaRef);
    let allMeals: MealOption[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        cost: data.price,
        nutrition: data.nutritionScore, // Ensure these exist in DB
        time: data.prepTime,            // Ensure these exist in DB
        source: 'Cafeteria'
      };
    });
    */
    // --- FIREBASE FETCH END ---

    // DUMMY DATA FOR TESTING:
    let allMeals: MealOption[] = [
      { id: '1', name: 'SST Cafe Jollof & Turkey', cost: 4500, nutrition: 7, time: 5, source: 'Cafeteria' },
      { id: '2', name: 'Bukka Indomie & Egg', cost: 1200, nutrition: 4, time: 10, source: 'Cafeteria' },
      { id: '3', name: 'Crabberry Salad', cost: 3000, nutrition: 9, time: 5, source: 'Cafeteria' },
      { id: '4', name: 'Premium Steak (Out of Budget)', cost: 15000, nutrition: 8, time: 20, source: 'Cafeteria' }
    ];

    // 1. Hard Constraint Filter: Remove anything strictly above budget
    const affordableMeals = allMeals.filter(meal => meal.cost <= userBudgetGoal);

    // 2. Run Algorithm
    const weights = getAHPWeights();
    const rankedMeals = runTOPSIS(affordableMeals, weights);

    return NextResponse.json({
      success: true,
      appliedWeights: { cost: weights[0], nutrition: weights[1], time: weights[2] },
      results: rankedMeals
    });

  } catch (error) {
    console.error("Recommendation Error:", error);
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 });
  }
}