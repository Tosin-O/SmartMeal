// // lib/mcdm.ts

// export type MealOption = {
//   id: string;
//   name: string;
//   cost: number;
//   nutrition: number;
//   time: number;
//   source: 'Cafeteria' | 'Recipe';
// };

// // 1. AHP: Calculate Weights with Budget Priority
// export function getAHPWeights(): number[] {
//   // Default matrix: Cost (0), Nutrition (1), Time (2)
//   const matrix = [
//     [1, 7, 5],     // Cost dominates Nutrition (7) and Time (5)
//     [1/7, 1, 1/3], // Nutrition vs others
//     [1/5, 3, 1]    // Time vs others
//   ];

//   const n = matrix.length;
//   const colSum = Array(n).fill(0);
  
//   for (let j = 0; j < n; j++) {
//     for (let i = 0; i < n; i++) colSum[j] += matrix[i][j];
//   }

//   const normalized = matrix.map(row => row.map((val, j) => val / colSum[j]));
//   return normalized.map(row => row.reduce((a, b) => a + b, 0) / n);
// }

// // 2. TOPSIS: Run the ranking algorithm
// export function runTOPSIS(meals: MealOption[], weights: number[]): (MealOption & { score: number })[] {
//   if (meals.length === 0) return [];

//   // Criteria setup: Cost (minimize), Nutrition (maximize), Time (minimize)
//   const isBenefit = [false, true, false]; 
  
//   // Step 1: Create Decision Matrix
//   const matrix = meals.map(m => [m.cost, m.nutrition, m.time]);
//   const n = matrix.length;
//   const m = matrix[0].length;

//   // Step 2: Normalize
//   const denom = Array(m).fill(0);
//   for (let j = 0; j < m; j++) {
//     for (let i = 0; i < n; i++) denom[j] += matrix[i][j] ** 2;
//     denom[j] = Math.sqrt(denom[j]);
//   }
//   const normalized = matrix.map(row => row.map((val, j) => val / denom[j]));

//   // Step 3: Apply Weights
//   const weighted = normalized.map(row => row.map((val, j) => val * weights[j]));

// // Step 4: Find Ideals
//   const ideal: number[] = [];
//   const antiIdeal: number[] = [];
//   for (let j = 0; j < m; j++) {
//     const col = weighted.map(row => row[j]);
//     if (isBenefit[j]) {
//       ideal.push(Math.max(...col));
//       antiIdeal.push(Math.min(...col));
//     } else {
//       ideal.push(Math.min(...col));
//       antiIdeal.push(Math.max(...col));
//     }
//   }

//   // Step 5: Calculate Euclidean Distances & Final Score
//   return meals.map((meal, i) => {
//     const row = weighted[i];
//     const dPlus = Math.sqrt(row.reduce((sum, val, j) => sum + (val - ideal[j]) ** 2, 0));
//     const dMinus = Math.sqrt(row.reduce((sum, val, j) => sum + (val - antiIdeal[j]) ** 2, 0));
    
//     // Prevent division by zero fallback
//     const score = dMinus / (dPlus + dMinus || 0.000001); 
    
//     return { ...meal, score };
//   }).sort((a, b) => b.score - a.score); // Sort highest to lowest
// }


//Improved Algorithm
// lib/mcdm.ts

export type MealOption = {
  id: string;
  name: string;
  cost: number;
  time: number;
  effort: number;
  pantryMatch: number;
  source: 'Cafeteria' | 'Recipe';
  missingItems?: { name: string, cost: number }[]; // <-- ADD THIS LINE
};

// 1. AHP: Calculate Weights for 4 Criteria
export function getAHPWeights(): number[] {
  // Order: [Cost, Time, Effort, PantryMatch]
  const matrix = [
    [1,   5,   5,   3],   // Cost: Strongly more important than Time/Effort, slightly more than PantryMatch
    [1/5, 1,   1,   1/3], // Time: Equal to Effort, less important than PantryMatch
    [1/5, 1,   1,   1/3], // Effort: Equal to Time, less important than PantryMatch
    [1/3, 3,   3,   1]    // PantryMatch: More important than Time/Effort, less than Cost
  ];

  const n = matrix.length;
  const colSum = Array(n).fill(0);
  
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) colSum[j] += matrix[i][j];
  }

  const normalized = matrix.map(row => row.map((val, j) => val / colSum[j]));
  return normalized.map(row => row.reduce((a, b) => a + b, 0) / n);
}

// 2. TOPSIS: Run the ranking algorithm
export function runTOPSIS(meals: MealOption[], weights: number[]): (MealOption & { score: number })[] {
  if (meals.length === 0) return [];

  // Criteria setup: Cost (min), Time (min), Effort (min), PantryMatch (max)
  const isBenefit = [false, false, false, true]; 
  
  // Step 1: Create Decision Matrix
  const matrix = meals.map(m => [m.cost, m.time, m.effort, m.pantryMatch]);
  const n = matrix.length;
  const m = matrix[0].length;

  // Step 2: Normalize
  const denom = Array(m).fill(0);
  for (let j = 0; j < m; j++) {
    for (let i = 0; i < n; i++) denom[j] += matrix[i][j] ** 2;
    denom[j] = Math.sqrt(denom[j]);
  }
  
  // Handle edge case where a column is all zeros (e.g., all meals cost 0)
  const normalized = matrix.map(row => 
    row.map((val, j) => denom[j] === 0 ? 0 : val / denom[j])
  );

  // Step 3: Apply Weights
  const weighted = normalized.map(row => row.map((val, j) => val * weights[j]));

  // Step 4: Find Ideals (Strictly typed arrays to prevent build errors)
  const ideal: number[] = [];
  const antiIdeal: number[] = [];
  
  for (let j = 0; j < m; j++) {
    const col = weighted.map(row => row[j]);
    if (isBenefit[j]) {
      ideal.push(Math.max(...col));
      antiIdeal.push(Math.min(...col));
    } else {
      ideal.push(Math.min(...col));
      antiIdeal.push(Math.max(...col));
    }
  }

  // Step 5: Calculate Euclidean Distances & Final Score
  return meals.map((meal, i) => {
    const row = weighted[i];
    const dPlus = Math.sqrt(row.reduce((sum, val, j) => sum + (val - ideal[j]) ** 2, 0));
    const dMinus = Math.sqrt(row.reduce((sum, val, j) => sum + (val - antiIdeal[j]) ** 2, 0));
    
    // Prevent division by zero fallback
    const score = dMinus / (dPlus + dMinus || 0.000001); 
    
    return { ...meal, score };
  }).sort((a, b) => b.score - a.score); // Sort highest to lowest
}