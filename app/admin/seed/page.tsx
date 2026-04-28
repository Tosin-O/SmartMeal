'use client';

import { useState } from 'react';
import { writeBatch, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function SeedCafeteriaOnly() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const seedData = async () => {
    setStatus('loading');
    setErrorMessage('');

    try {
      const batch = writeBatch(db);

      // ==========================================
      // CAFETERIA MEALS DATABASE (25 Items)
      // Categorized for SmartMeal Filtering
      // ==========================================
      const cafeteriaMeals = [
        // School Cafeteria
        { name: 'Jollof Rice & Beef', price: 1500, cafeteriaName: 'School Cafeteria', category: 'Lunch', isAvailable: true },
        { name: 'White Rice, Beans & Stew', price: 1200, cafeteriaName: 'School Cafeteria', category: 'Lunch', isAvailable: true },
        { name: 'Fried Plantain (Extra)', price: 500, cafeteriaName: 'School Cafeteria', category: 'Sides', isAvailable: true },
        
        // Mama Put
        { name: 'Amala, Ewedu & Assorted Meat', price: 2500, cafeteriaName: 'Mama Put', category: 'Dinner', isAvailable: true },
        { name: 'Pounded Yam & Egusi Soup', price: 3000, cafeteriaName: 'Mama Put', category: 'Lunch', isAvailable: true },
        { name: 'Eba & Bitterleaf Soup', price: 2000, cafeteriaName: 'Mama Put', category: 'Dinner', isAvailable: true },

        // Redwood
        { name: 'Special Fried Rice & Roast Chicken', price: 3500, cafeteriaName: 'Redwood', category: 'Lunch', isAvailable: true },
        { name: 'Spaghetti Bolognese', price: 2800, cafeteriaName: 'Redwood', category: 'Dinner', isAvailable: true },
        { name: 'Asaro (Yam Porridge) & Fish', price: 2200, cafeteriaName: 'Redwood', category: 'Lunch', isAvailable: false },

        // Coop Queens
        { name: 'Indomie Super Pack & Fried Egg', price: 1200, cafeteriaName: 'Coop Queens', category: 'Dinner', isAvailable: true },
        { name: 'Plantain Frittata', price: 1800, cafeteriaName: 'Coop Queens', category: 'Breakfast', isAvailable: true },
        { name: 'Chicken Shawarma', price: 2500, cafeteriaName: 'Coop Queens', category: 'Snacks', isAvailable: true },

        // Coop Boys
        { name: 'Ewa Agoyin & Bread', price: 1500, cafeteriaName: 'Coop Boys', category: 'Breakfast', isAvailable: true },
        { name: 'Concoction Rice & Boiled Egg', price: 1300, cafeteriaName: 'Coop Boys', category: 'Lunch', isAvailable: true },
        { name: 'Extra Large Jollof & Ponmo', price: 1800, cafeteriaName: 'Coop Boys', category: 'Dinner', isAvailable: true },

        // EDC
        { name: 'Beef Sausage Roll', price: 1000, cafeteriaName: 'EDC', category: 'Snacks', isAvailable: true },
        { name: 'Chicken Caesar Salad', price: 3500, cafeteriaName: 'EDC', category: 'Lunch', isAvailable: true },
        { name: 'Grilled Chicken Panini', price: 2800, cafeteriaName: 'EDC', category: 'Snacks', isAvailable: true },

        // Amethyst
        { name: 'Grilled Croaker Fish & Yam Chips', price: 6500, cafeteriaName: 'Amethyst', category: 'Dinner', isAvailable: true },
        { name: 'English Breakfast Combo', price: 4000, cafeteriaName: 'Amethyst', category: 'Breakfast', isAvailable: true },
        { name: 'Seafood Pasta', price: 5500, cafeteriaName: 'Amethyst', category: 'Dinner', isAvailable: true },

        // Student Centre
        { name: 'Double Beef Burger', price: 4500, cafeteriaName: 'Student Centre', category: 'Snacks', isAvailable: true },
        { name: 'Beef Suya (Evening Only)', price: 2000, cafeteriaName: 'Student Centre', category: 'Sides', isAvailable: false },
        { name: 'Mixed Fruit Smoothie', price: 2500, cafeteriaName: 'Student Centre', category: 'Snacks', isAvailable: true },
        { name: 'Jumbo Hotdog', price: 1500, cafeteriaName: 'Student Centre', category: 'Snacks', isAvailable: true },
      ];

      cafeteriaMeals.forEach((meal) => {
        const formattedName = meal.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
        const mealId = `meal_${formattedName}`;

        const ref = doc(db, 'cafeteria_meals', mealId);
        batch.set(ref, {
          mealId: mealId,
          name: meal.name,
          price: meal.price,
          category: meal.category,
          cafeteriaName: meal.cafeteriaName,
          isAvailable: meal.isAvailable,
          lastUpdated: new Date()
        });
      });

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
        <h1 className="text-2xl font-bold text-white mb-4">Cafeteria Seeder</h1>
        <p className="text-sm text-gray-400 mb-8">
          This will populate the <strong>cafeteria_meals</strong> collection with 25 categorized items.
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
            <p className="font-bold animate-pulse">Syncing campus menu...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="py-4">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-900/30 flex items-center justify-center text-[#1CD05D]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-lg font-bold text-white mb-2">Success!</p>
            <p className="text-sm text-gray-400">Cafeteria data is live.</p>
          </div>
        )}

        {status === 'error' && (
          <div className="py-4">
            <p className="text-red-500 font-bold mb-2">Seeding failed</p>
            <p className="text-xs text-gray-400">{errorMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}