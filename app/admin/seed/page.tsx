// 'use client';

// import { useState } from 'react';
// import { writeBatch, doc } from 'firebase/firestore';
// import { db } from '@/lib/firebase';

// export default function SeedDatabasePartThree() {
//   const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
//   const [errorMessage, setErrorMessage] = useState('');

//   const seedData = async () => {
//     setStatus('loading');
//     setErrorMessage('');

//     try {
//       const batch = writeBatch(db);

//       // ==========================================
//       // 1. BRAND NEW INGREDIENTS (20 Items)
//       // ==========================================
//       const newIngredients = [
//         // Swallows & Carbs
//         { id: 'ing_fufu', name: 'Fufu (Cassava Flour)', category: 'Grains', unitPrice: 1000, baseUnit: '1kg' },
//         { id: 'ing_wheat', name: 'Wheat Flour', category: 'Grains', unitPrice: 1500, baseUnit: '1kg' },
//         { id: 'ing_unripe_plantain', name: 'Unripe Plantain', category: 'Produce', unitPrice: 1000, baseUnit: '1 Bunch' },
//         { id: 'ing_noodles', name: 'Instant Noodles', category: 'Grains', unitPrice: 4500, baseUnit: '1 Carton' },
//         { id: 'ing_basmati', name: 'Basmati Rice', category: 'Grains', unitPrice: 4000, baseUnit: '1kg' },
//         { id: 'ing_bread', name: 'Sliced Bread', category: 'Grains', unitPrice: 1200, baseUnit: '1 Loaf' },
        
//         // Proteins
//         { id: 'ing_sausage', name: 'Sausages (Hotdogs)', category: 'Proteins', unitPrice: 1500, baseUnit: '1 Pack' },
//         { id: 'ing_sardine', name: 'Canned Sardines', category: 'Proteins', unitPrice: 900, baseUnit: '1 Tin' },
//         { id: 'ing_corned_beef', name: 'Corned Beef', category: 'Proteins', unitPrice: 2500, baseUnit: '1 Tin' },
//         { id: 'ing_catfish', name: 'Fresh Catfish', category: 'Proteins', unitPrice: 4500, baseUnit: '1kg' },
//         { id: 'ing_pork', name: 'Pork Meat', category: 'Proteins', unitPrice: 4000, baseUnit: '1kg' },
//         { id: 'ing_bonga', name: 'Dried Bonga Fish', category: 'Proteins', unitPrice: 1500, baseUnit: '1 Pack' },
        
//         // Vegetables & Leaves
//         { id: 'ing_cabbage', name: 'Cabbage', category: 'Vegetables', unitPrice: 1000, baseUnit: '1 Head' },
//         { id: 'ing_spring_onion', name: 'Spring Onions', category: 'Vegetables', unitPrice: 500, baseUnit: '1 Bunch' },
//         { id: 'ing_uziza', name: 'Uziza Leaves', category: 'Vegetables', unitPrice: 400, baseUnit: '1 Bunch' },
//         { id: 'ing_oha', name: 'Oha Leaves', category: 'Vegetables', unitPrice: 500, baseUnit: '1 Bunch' },
//         { id: 'ing_waterleaf', name: 'Waterleaf', category: 'Vegetables', unitPrice: 400, baseUnit: '1 Bunch' },
        
//         // Spices & Extras
//         { id: 'ing_suya_spice', name: 'Yaji (Suya Spice)', category: 'Spices', unitPrice: 800, baseUnit: '1 Cup' },
//         { id: 'ing_nutmeg', name: 'Nutmeg', category: 'Spices', unitPrice: 500, baseUnit: '1 Pack' },
//         { id: 'ing_coconut_milk', name: 'Coconut Milk', category: 'Spices', unitPrice: 1500, baseUnit: '1 Can' },
//       ];

//       newIngredients.forEach((ing) => {
//         const ref = doc(db, 'market_ingredients', ing.id);
//         batch.set(ref, {
//           ingredientId: ing.id,
//           name: ing.name,
//           category: ing.category,
//           unitPrice: ing.unitPrice,
//           baseUnit: ing.baseUnit,
//         });
//       });

//       // ==========================================
//       // 2. BRAND NEW RECIPES (15 Items)
//       // ==========================================
//       const newRecipes = [
//         // TRADITIONAL SOUPS
//         {
//           id: 'rec_oha', title: 'Ofe Oha & Fufu', description: 'A classic Eastern Nigerian soup thickened with cocoyam or achi.', category: 'Dinner',
//           instructions: ['Boil meats and stockfish until tender.', 'Thicken the broth with your preferred thickener and add palm oil.', 'Add shredded Oha and Uziza leaves.', 'Serve with hot Fufu.'],
//           ingredientsNeeded: [{ ingredientId: 'ing_oha', amount: 1, unit: 'Bunch' }, { ingredientId: 'ing_uziza', amount: 1, unit: 'Bunch' }, { ingredientId: 'ing_fufu', amount: 1, unit: 'kg' }, { ingredientId: 'ing_palmoil', amount: 0.2, unit: 'L' }],
//           estimatedCost: 8500, prepTime: '60 mins', status: 'LIVE', tags: ['TRADITIONAL', 'PREMIUM']
//         },
//         {
//           id: 'rec_edikaikong', title: 'Edikaikong Soup', description: 'Vegetable-packed, nutrient-dense soup from the South-South.', category: 'Lunch',
//           instructions: ['Cook beef and dry fish with minimal water.', 'Add generous palm oil and crayfish.', 'Stir in chopped waterleaves to wilt.', 'Finish with shredded Ugwu leaves and do not overcook.'],
//           ingredientsNeeded: [{ ingredientId: 'ing_waterleaf', amount: 2, unit: 'Bunch' }, { ingredientId: 'ing_ugwu', amount: 2, unit: 'Bunch' }, { ingredientId: 'ing_beef', amount: 1, unit: 'kg' }, { ingredientId: 'ing_palmoil', amount: 0.5, unit: 'L' }],
//           estimatedCost: 11000, prepTime: '55 mins', status: 'LIVE', tags: ['HIGH NUTRITION', 'VEGETABLE']
//         },

//         // RICE DISHES
//         {
//           id: 'rec_coconut_rice', title: 'Nigerian Coconut Rice', description: 'Flavorful rice cooked in rich, aromatic coconut milk.', category: 'Dinner',
//           instructions: ['Parboil rice and set aside.', 'Boil coconut milk, chicken stock, and pepper mix.', 'Add the rice, dry fish, and prawns.', 'Steam until the coconut milk is fully absorbed.'],
//           ingredientsNeeded: [{ ingredientId: 'ing_rice', amount: 1, unit: 'kg' }, { ingredientId: 'ing_coconut_milk', amount: 1, unit: 'Can' }, { ingredientId: 'ing_dryfish', amount: 1, unit: 'Piece' }, { ingredientId: 'ing_vegoil', amount: 0.1, unit: 'L' }],
//           estimatedCost: 7500, prepTime: '55 mins', status: 'LIVE', tags: ['AROMATIC', 'FESTIVE']
//         },
//         {
//           id: 'rec_basmati_fried', title: 'Basmati Fried Rice', description: 'A premium, non-sticky take on classic fried rice.', category: 'Lunch',
//           instructions: ['Wash Basmati rice until water runs clear, then cook in broth.', 'Stir-fry carrots, spring onions, and sausages.', 'Combine rice and vegetables in batches on high heat.'],
//           ingredientsNeeded: [{ ingredientId: 'ing_basmati', amount: 1, unit: 'kg' }, { ingredientId: 'ing_spring_onion', amount: 1, unit: 'Bunch' }, { ingredientId: 'ing_sausage', amount: 1, unit: 'Pack' }, { ingredientId: 'ing_vegoil', amount: 0.2, unit: 'L' }],
//           estimatedCost: 9500, prepTime: '45 mins', status: 'LIVE', tags: ['PREMIUM', 'QUICK']
//         },

//         // PLANTAIN & YAM
//         {
//           id: 'rec_unripe_plantain', title: 'Unripe Plantain Porridge', description: 'Iron-rich, savory porridge loaded with dry fish.', category: 'Dinner',
//           instructions: ['Peel and chop unripe plantains.', 'Boil with bonga fish, crayfish, and palm oil.', 'Mash a few plantains to naturally thicken the sauce.', 'Garnish with scent leaves.'],
//           ingredientsNeeded: [{ ingredientId: 'ing_unripe_plantain', amount: 1, unit: 'Bunch' }, { ingredientId: 'ing_bonga', amount: 1, unit: 'Pack' }, { ingredientId: 'ing_palmoil', amount: 0.2, unit: 'L' }],
//           estimatedCost: 4500, prepTime: '40 mins', status: 'LIVE', tags: ['HEALTHY', 'IRON RICH']
//         },
//         {
//           id: 'rec_plantain_frittata', title: 'Plantain Frittata', description: 'A beautiful baked mix of fried plantains, eggs, and sausages.', category: 'Breakfast',
//           instructions: ['Fry diced ripe plantains until golden.', 'Whisk eggs with chopped sausages, bell peppers, and onions.', 'Pour egg mix over the plantains in a pan and bake or cook on low heat until set.'],
//           ingredientsNeeded: [{ ingredientId: 'ing_plantain', amount: 1, unit: 'Bunch' }, { ingredientId: 'ing_egg', amount: 0.3, unit: 'Crate' }, { ingredientId: 'ing_sausage', amount: 0.5, unit: 'Pack' }, { ingredientId: 'ing_vegoil', amount: 0.2, unit: 'L' }],
//           estimatedCost: 5500, prepTime: '35 mins', status: 'LIVE', tags: ['BREAKFAST', 'FANCY']
//         },
//         {
//           id: 'rec_yam_cornedbeef', title: 'Boiled Yam & Corned Beef Sauce', description: 'A rich, meaty tomato sauce perfect for Sunday mornings.', category: 'Breakfast',
//           instructions: ['Boil yam chunks until soft.', 'Fry onions and tomatoes in vegetable oil.', 'Stir in canned corned beef and simmer until the oils separate.'],
//           ingredientsNeeded: [{ ingredientId: 'ing_yam', amount: 0.5, unit: 'Tuber' }, { ingredientId: 'ing_corned_beef', amount: 1, unit: 'Tin' }, { ingredientId: 'ing_tomato', amount: 0.2, unit: 'Basket' }, { ingredientId: 'ing_vegoil', amount: 0.1, unit: 'L' }],
//           estimatedCost: 6000, prepTime: '30 mins', status: 'LIVE', tags: ['EASY', 'BREAKFAST']
//         },

//         // QUICK MEALS & BREAKFAST
//         {
//           id: 'rec_noodles_egg', title: 'Stir-fry Noodles & Egg', description: 'The ultimate late-night quick fix.', category: 'Dinner',
//           instructions: ['Boil instant noodles briefly and drain water.', 'Stir-fry with chopped carrots, spring onions, and sausages.', 'Fry an egg on the side or scramble it in.'],
//           ingredientsNeeded: [{ ingredientId: 'ing_noodles', amount: 0.1, unit: 'Carton' }, { ingredientId: 'ing_egg', amount: 0.1, unit: 'Crate' }, { ingredientId: 'ing_sausage', amount: 0.2, unit: 'Pack' }, { ingredientId: 'ing_spring_onion', amount: 0.2, unit: 'Bunch' }],
//           estimatedCost: 1500, prepTime: '15 mins', status: 'LIVE', tags: ['QUICK', 'STUDENT FAV']
//         },
//         {
//           id: 'rec_bread_sardine', title: 'Bread & Sardine Pepper Sauce', description: 'A spicy, savory dip for fresh sliced bread.', category: 'Breakfast',
//           instructions: ['Mash canned sardines lightly.', 'Fry a quick, spicy tomato and pepper sauce.', 'Stir the sardines into the sauce and serve with fresh sliced bread.'],
//           ingredientsNeeded: [{ ingredientId: 'ing_bread', amount: 1, unit: 'Loaf' }, { ingredientId: 'ing_sardine', amount: 2, unit: 'Tin' }, { ingredientId: 'ing_vegoil', amount: 0.1, unit: 'L' }],
//           estimatedCost: 3500, prepTime: '15 mins', status: 'LIVE', tags: ['NO COOK', 'FAST']
//         },

//         // PROTEINS & EXTRAS
//         {
//           id: 'rec_catfish_pointkill', title: 'Point & Kill Catfish Peppersoup', description: 'Bar-style, whole fresh catfish in a spicy, watery broth.', category: 'Dinner',
//           instructions: ['Wash live catfish thoroughly with hot water and salt to remove slime.', 'Boil water with peppersoup spices, ginger, garlic, and habaneros.', 'Drop in the fish and simmer gently. Garnish with Uziza leaves.'],
//           ingredientsNeeded: [{ ingredientId: 'ing_catfish', amount: 1, unit: 'kg' }, { ingredientId: 'ing_uziza', amount: 1, unit: 'Bunch' }, { ingredientId: 'ing_rodo', amount: 1, unit: 'Portion' }],
//           estimatedCost: 6500, prepTime: '35 mins', status: 'LIVE', tags: ['SPICY', 'BAR GRUB']
//         },
//         {
//           id: 'rec_beef_suya', title: 'Homemade Beef Suya', description: 'Thinly sliced beef, heavily spiced and grilled.', category: 'Lunch',
//           instructions: ['Slice beef as thinly as possible.', 'Coat thoroughly in Yaji (Suya spice) and a little vegetable oil.', 'Thread onto skewers and grill or bake until charred.', 'Serve with fresh onions and cabbage.'],
//           ingredientsNeeded: [{ ingredientId: 'ing_beef', amount: 1, unit: 'kg' }, { ingredientId: 'ing_suya_spice', amount: 1, unit: 'Cup' }, { ingredientId: 'ing_cabbage', amount: 0.5, unit: 'Head' }, { ingredientId: 'ing_onion', amount: 1, unit: 'Portion' }],
//           estimatedCost: 6000, prepTime: '50 mins', status: 'LIVE', tags: ['SNACK', 'SPICY']
//         },
//         {
//           id: 'rec_cabbage_stew', title: 'Cabbage & Minced Meat Stew', description: 'A healthy, low-carb sauce perfect for white rice or boiled potatoes.', category: 'Lunch',
//           instructions: ['Shred cabbage thinly.', 'Brown minced meat or chopped beef in a pan.', 'Add tomato paste and spices to make a rich base.', 'Toss in the shredded cabbage and cook for just 3 minutes to retain crunch.'],
//           ingredientsNeeded: [{ ingredientId: 'ing_cabbage', amount: 1, unit: 'Head' }, { ingredientId: 'ing_beef', amount: 0.5, unit: 'kg' }, { ingredientId: 'ing_tomato', amount: 0.2, unit: 'Basket' }, { ingredientId: 'ing_vegoil', amount: 0.1, unit: 'L' }],
//           estimatedCost: 4500, prepTime: '30 mins', status: 'DRAFT', tags: ['LOW CARB', 'HEALTHY']
//         },
//         {
//           id: 'rec_pork_sauce', title: 'Spicy Pork Sauce', description: 'Tender pork bits in a dark, intensely spicy onion sauce.', category: 'Dinner',
//           instructions: ['Dice pork meat into small chunks and boil with spices.', 'Fry the pork bits until crispy on the outside.', 'Create a dark sauce using lots of onions, soy sauce, and black pepper.', 'Toss the pork in the sauce.'],
//           ingredientsNeeded: [{ ingredientId: 'ing_pork', amount: 1, unit: 'kg' }, { ingredientId: 'ing_onion', amount: 2, unit: 'Portion' }, { ingredientId: 'ing_vegoil', amount: 0.1, unit: 'L' }],
//           estimatedCost: 5500, prepTime: '45 mins', status: 'LIVE', tags: ['PROTEIN', 'CHEWY']
//         },
//         {
//           id: 'rec_wheat_banga', title: 'Wheat Swallow & Banga Soup', description: 'A robust Niger-Delta palm nut soup served with wheat.', category: 'Dinner',
//           instructions: ['Extract juice from boiled palm nuts.', 'Boil the thick extract with Banga spices, fresh catfish, and dried bonga fish.', 'Stir wheat flour into boiling water to make a firm swallow.'],
//           ingredientsNeeded: [{ ingredientId: 'ing_wheat', amount: 1, unit: 'kg' }, { ingredientId: 'ing_catfish', amount: 1, unit: 'kg' }, { ingredientId: 'ing_bonga', amount: 1, unit: 'Pack' }, { ingredientId: 'ing_palmoil', amount: 1, unit: 'L' }],
//           estimatedCost: 11500, prepTime: '65 mins', status: 'LIVE', tags: ['TRADITIONAL', 'RICH']
//         }
//       ];

//       newRecipes.forEach((rec) => {
//         const ref = doc(db, 'recipes', rec.id);
//         batch.set(ref, {
//           recipeId: rec.id,
//           title: rec.title,
//           description: rec.description,
//           category: rec.category,
//           instructions: rec.instructions,
//           ingredientsNeeded: rec.ingredientsNeeded,
//           estimatedCost: rec.estimatedCost,
//           prepTime: rec.prepTime,
//           tags: rec.tags,
//           status: rec.status,
//         });
//       });

//       await batch.commit();
//       setStatus('success');

//     } catch (error: any) {
//       console.error("Error seeding database part 3:", error);
//       setErrorMessage(error.message);
//       setStatus('error');
//     }
//   };

//   return (
//     <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
//       <div className="max-w-md w-full p-8 bg-[#111111] border border-[#2A2A2A] rounded-2xl text-center">
//         <h1 className="text-2xl font-bold text-white mb-4">Database Seeder: Part 3</h1>
//         <p className="text-sm text-gray-400 mb-8">
//           This will append 20 more ingredients and 15 brand new, distinct recipes to your database.
//         </p>

//         {status === 'idle' && (
//           <button 
//             onClick={seedData}
//             className="w-full py-3 font-bold text-gray-900 bg-[#1CD05D] rounded-xl hover:bg-[#15b04d] transition-colors"
//           >
//             RUN SEED SCRIPT (PART 3)
//           </button>
//         )}

//         {status === 'loading' && (
//           <div className="flex flex-col items-center justify-center py-4 text-[#1CD05D]">
//             <div className="w-8 h-8 border-4 border-[#1CD05D] border-t-transparent rounded-full animate-spin mb-4"></div>
//             <p className="font-bold animate-pulse">Writing 35 new documents to Firestore...</p>
//           </div>
//         )}

//         {status === 'success' && (
//           <div className="py-4">
//             <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-900/30 flex items-center justify-center text-[#1CD05D]">
//               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
//             </div>
//             <p className="text-lg font-bold text-white mb-2">Success!</p>
//             <p className="text-sm text-gray-400">Your total database now contains 70 ingredients and 50 unique recipes.</p>
//           </div>
//         )}

//         {status === 'error' && (
//           <div className="py-4">
//             <p className="text-red-500 font-bold mb-2">An error occurred</p>
//             <p className="text-xs text-gray-400 wrap-break-word">{errorMessage}</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }





'use client';

import { useState } from 'react';
import { writeBatch, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function SeedDatabasePartFour() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const seedData = async () => {
    setStatus('loading');
    setErrorMessage('');

    try {
      const batch = writeBatch(db);

      // ==========================================
      // 4. CAFETERIA MEALS DATABASE (25 Items)
      // Spread across the specific user-provided locations
      // ==========================================
      const cafeteriaMeals = [
        // School Cafeteria (Standard student meals)
        { name: 'Jollof Rice & Beef', price: 1500, cafeteriaName: 'School Cafeteria', isAvailable: true },
        { name: 'White Rice, Beans & Stew', price: 1200, cafeteriaName: 'School Cafeteria', isAvailable: true },
        { name: 'Fried Plantain (Extra)', price: 500, cafeteriaName: 'School Cafeteria', isAvailable: true },
        
        // Mama Put (Heavy, traditional local food)
        { name: 'Amala, Ewedu & Assorted Meat', price: 2500, cafeteriaName: 'Mama Put', isAvailable: true },
        { name: 'Pounded Yam & Egusi Soup', price: 3000, cafeteriaName: 'Mama Put', isAvailable: true },
        { name: 'Eba & Bitterleaf Soup', price: 2000, cafeteriaName: 'Mama Put', isAvailable: true },

        // Redwood (Slightly premium/specific combos)
        { name: 'Special Fried Rice & Roast Chicken', price: 3500, cafeteriaName: 'Redwood', isAvailable: true },
        { name: 'Spaghetti Bolognese', price: 2800, cafeteriaName: 'Redwood', isAvailable: true },
        { name: 'Asaro (Yam Porridge) & Fish', price: 2200, cafeteriaName: 'Redwood', isAvailable: false }, // Mocking a sold-out item

        // Coop Queens (Female hostel area - lighter meals, quick foods)
        { name: 'Indomie Super Pack & Fried Egg', price: 1200, cafeteriaName: 'Coop Queens', isAvailable: true },
        { name: 'Plantain Frittata', price: 1800, cafeteriaName: 'Coop Queens', isAvailable: true },
        { name: 'Chicken Shawarma', price: 2500, cafeteriaName: 'Coop Queens', isAvailable: true },

        // Coop Boys (Male hostel area - bulk, heavy student staples)
        { name: 'Ewa Agoyin & Bread', price: 1500, cafeteriaName: 'Coop Boys', isAvailable: true },
        { name: 'Concoction Rice & Boiled Egg', price: 1300, cafeteriaName: 'Coop Boys', isAvailable: true },
        { name: 'Extra Large Jollof & Ponmo', price: 1800, cafeteriaName: 'Coop Boys', isAvailable: true },

        // EDC (Enterprise Development Centre - professional, quick lunches, pastries)
        { name: 'Beef Sausage Roll', price: 1000, cafeteriaName: 'EDC', isAvailable: true },
        { name: 'Chicken Caesar Salad', price: 3500, cafeteriaName: 'EDC', isAvailable: true },
        { name: 'Grilled Chicken Panini', price: 2800, cafeteriaName: 'EDC', isAvailable: true },

        // Amethyst (Premium hostel/dining)
        { name: 'Grilled Croaker Fish & Yam Chips', price: 6500, cafeteriaName: 'Amethyst', isAvailable: true },
        { name: 'English Breakfast Combo', price: 4000, cafeteriaName: 'Amethyst', isAvailable: true },
        { name: 'Seafood Pasta', price: 5500, cafeteriaName: 'Amethyst', isAvailable: true },

        // Student Centre (Hub for fast food and snacks)
        { name: 'Double Beef Burger', price: 4500, cafeteriaName: 'Student Centre', isAvailable: true },
        { name: 'Beef Suya (Evening Only)', price: 2000, cafeteriaName: 'Student Centre', isAvailable: false }, // Mocking sold-out
        { name: 'Mixed Fruit Smoothie', price: 2500, cafeteriaName: 'Student Centre', isAvailable: true },
        { name: 'Jumbo Hotdog', price: 1500, cafeteriaName: 'Student Centre', isAvailable: true },
      ];

      // Format IDs and add to batch
      cafeteriaMeals.forEach((meal) => {
        // Generate a clean ID like 'meal_jollof_rice_beef'
        const formattedName = meal.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
        const mealId = `meal_${formattedName}`;

        const ref = doc(db, 'cafeteria_meals', mealId);
        batch.set(ref, {
          mealId: mealId,
          name: meal.name,
          price: meal.price,
          cafeteriaName: meal.cafeteriaName,
          isAvailable: meal.isAvailable,
          lastUpdated: new Date() // Add a timestamp for realism
        });
      });

      // Commit the batch to Firestore
      await batch.commit();
      setStatus('success');

    } catch (error: any) {
      console.error("Error seeding cafeteria data:", error);
      setErrorMessage(error.message);
      setStatus('error');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <div className="max-w-md w-full p-8 bg-[#111111] border border-[#2A2A2A] rounded-2xl text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Database Seeder: Part 4</h1>
        <p className="text-sm text-gray-400 mb-8">
          This will safely populate your <strong>cafeteria_meals</strong> collection with 25 realistic campus meals across 8 specific locations.
        </p>

        {status === 'idle' && (
          <button 
            onClick={seedData}
            className="w-full py-3 font-bold text-gray-900 bg-[#1CD05D] rounded-xl hover:bg-[#15b04d] transition-colors"
          >
            SEED CAFETERIA DATA
          </button>
        )}

        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center py-4 text-[#1CD05D]">
            <div className="w-8 h-8 border-4 border-[#1CD05D] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-bold animate-pulse">Writing cafeteria menu to Firestore...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="py-4">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-900/30 flex items-center justify-center text-[#1CD05D]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            <p className="text-lg font-bold text-white mb-2">Success!</p>
            <p className="text-sm text-gray-400">Your Cafeteria Management page is now fully populated.</p>
          </div>
        )}

        {status === 'error' && (
          <div className="py-4">
            <p className="text-red-500 font-bold mb-2">An error occurred</p>
            <p className="text-xs text-gray-400 wrap-break-word">{errorMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}