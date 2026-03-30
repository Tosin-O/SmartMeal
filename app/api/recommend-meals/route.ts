// app/api/recommend-meals/route.ts
import { NextResponse } from 'next/server';
import { getAHPWeights, runTOPSIS, MealOption } from '@/lib/mcdm';

// Set your standard "Time-to-Table" for buying food on campus
const AVERAGE_CAFETERIA_WAIT_TIME = 15; 

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userBudgetGoal = body.budgetGoal || 5000;

    // --- MOCK DATA FOR TESTING ---
    
    // 1. Mock Cafeteria Meals (Time is forced to the constant)
    const mockCafeteriaMeals: MealOption[] = [
      { id: 'c1', name: 'SST Cafe Jollof & Turkey', cost: 4500, nutrition: 7, time: AVERAGE_CAFETERIA_WAIT_TIME, source: 'Cafeteria' },
      { id: 'c2', name: 'Bukka Indomie & Egg', cost: 1200, nutrition: 4, time: AVERAGE_CAFETERIA_WAIT_TIME, source: 'Cafeteria' },
      { id: 'c3', name: 'Crabberry Salad', cost: 3000, nutrition: 9, time: AVERAGE_CAFETERIA_WAIT_TIME, source: 'Cafeteria' },
      { id: 'c4', name: 'SST Premium Steak', cost: 15000, nutrition: 8, time: AVERAGE_CAFETERIA_WAIT_TIME, source: 'Cafeteria' } // Should get filtered out by budget
    ];

    // 2. Mock Recipes (Time is based on actual cooking prep time)
    const mockRecipeMeals: MealOption[] = [
      { id: 'r1', name: 'Homemade Beans & Plantain', cost: 2000, nutrition: 8, time: 90, source: 'Recipe' },
      { id: 'r2', name: 'Quick Peanut Butter Sandwich', cost: 800, nutrition: 5, time: 5, source: 'Recipe' },
      { id: 'r3', name: 'Homemade Chicken Stir Fry', cost: 3500, nutrition: 9, time: 45, source: 'Recipe' }
    ];

    // Combine both arrays into one master list for the algorithm
    const allMeals = [...mockCafeteriaMeals, ...mockRecipeMeals];

    // --- ALGORITHM PIPELINE ---

    // 1. Hard Constraint Filter: Remove anything strictly above budget
    const affordableMeals = allMeals.filter(meal => meal.cost <= userBudgetGoal);

    // 2. Run Algorithm
    const weights = getAHPWeights();
    const rankedMeals = runTOPSIS(affordableMeals, weights);

    return NextResponse.json({
      success: true,
      appliedWeights: { 
        cost: Number(weights[0].toFixed(3)), 
        nutrition: Number(weights[1].toFixed(3)), 
        time: Number(weights[2].toFixed(3)) 
      },
      results: rankedMeals
    });

  } catch (error) {
    console.error("Recommendation Error:", error);
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 });
  }
}