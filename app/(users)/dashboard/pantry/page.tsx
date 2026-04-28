'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

interface PantryItem {
  id: string;
  name: string;
  category: string;
  quantity: string;
}

const CATEGORIES = ['Vegetables', 'Proteins', 'Grains & Pasta', 'Dairy', 'Spices', 'Snacks', 'Other'];

// Smart helper to combine quantities (e.g. "1 kg" + "2 kg" = "3 kg")
function combineQuantities(existingQty: string, newQty: string): string {
  const eq = existingQty.trim();
  const nq = newQty.trim();

  // If both are just plain numbers
  if (!isNaN(Number(eq)) && !isNaN(Number(nq))) {
    return String(Number(eq) + Number(nq));
  }

  // Try to match number + unit (e.g., "2 kg", "3kg")
  const match1 = eq.match(/^([\d.]+)\s*([a-zA-Z]+)$/);
  const match2 = nq.match(/^([\d.]+)\s*([a-zA-Z]+)$/);

  // If both have the exact same unit, do the math!
  if (match1 && match2 && match1[2].toLowerCase() === match2[2].toLowerCase()) {
    return `${Number(match1[1]) + Number(match2[1])} ${match1[2]}`;
  }

  // Fallback: If units don't match, just combine them visually (e.g., "1 bag + 2 cups")
  return `${eq} + ${nq}`;
}

export default function PantryStockPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<PantryItem[]>([]);
  
  // Quick Add State
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Vegetables');
  const [newItemQuantity, setNewItemQuantity] = useState('1');
  const [isAdding, setIsAdding] = useState(false);

  // Fetch Pantry Items
  const fetchPantryItems = async (uid: string) => {
    try {
      const q = query(collection(db, 'pantry'), where('userId', '==', uid));
      const querySnapshot = await getDocs(q);
      const fetchedItems: PantryItem[] = [];
      querySnapshot.forEach((doc) => {
        fetchedItems.push({ id: doc.id, ...doc.data() } as PantryItem);
      });
      setItems(fetchedItems);
    } catch (error) {
      console.error("Error fetching pantry items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchPantryItems(user.uid);
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Handle Quick Add / Update
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newItemName.trim();
    if (!trimmedName) return;

    const user = auth.currentUser;
    if (!user) return;

    setIsAdding(true);
    try {
      // 1. Check if the item already exists (case-insensitive)
      const existingItem = items.find(
        (item) => item.name.toLowerCase() === trimmedName.toLowerCase()
      );

      if (existingItem) {
        // --- UPDATE EXISTING ITEM ---
        const combinedQuantity = combineQuantities(existingItem.quantity, newItemQuantity);
        
        const itemRef = doc(db, 'pantry', existingItem.id);
        await updateDoc(itemRef, {
          quantity: combinedQuantity,
          updatedAt: new Date() // Optional: good for tracking when it was last modified
        });

        // Update UI instantly
        setItems(items.map(item => 
          item.id === existingItem.id 
            ? { ...item, quantity: combinedQuantity } 
            : item
        ));

      } else {
        // --- ADD BRAND NEW ITEM ---
        const newItemData = {
          userId: user.uid,
          name: trimmedName,
          category: newItemCategory,
          quantity: newItemQuantity,
          addedAt: new Date()
        };

        const docRef = await addDoc(collection(db, 'pantry'), newItemData);
        
        // Update UI instantly
        setItems([{ id: docRef.id, ...newItemData }, ...items]);
      }
      
      // Reset form
      setNewItemName('');
      setNewItemQuantity('1');
      // Keeping category the same makes adding multiple similar items faster

    } catch (error) {
      console.error("Error saving item:", error);
      alert("Failed to save item. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  // Handle Delete
  const handleDeleteItem = async (id: string) => {
    const previousItems = [...items];
    setItems(items.filter(item => item.id !== id)); // Optimistic UI update

    try {
      await deleteDoc(doc(db, 'pantry', id));
    } catch (error) {
      console.error("Error deleting item:", error);
      setItems(previousItems); // Rollback if it fails
      alert("Failed to delete item.");
    }
  };

  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, PantryItem[]>);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#1CD05D] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pb-20 lg:pb-8">
      <main className="p-6 md:p-8 max-w-300 mx-auto w-full animate-in fade-in duration-500">
        
        <section className="mb-8">
          <p className="text-[#1CD05D] text-sm font-bold tracking-widest uppercase mb-2">Inventory</p>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Your Pantry Stock</h1>
          <p className="text-gray-400">Log what you have so we can recommend the right recipes.</p>
        </section>

        {/* Quick Add Bar */}
        <section className="mb-12 bg-[#111111] border border-[#2A2A2A] rounded-2xl p-5 shadow-lg">
          <form onSubmit={handleAddItem} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Item Name</label>
              <input 
                type="text" 
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="e.g. Rice, Tomatoes, Chicken..."
                className="w-full p-3.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl text-white focus:border-[#1CD05D] outline-none transition-colors"
                required
              />
            </div>
            
            <div className="w-full md:w-48">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Category</label>
              <div className="relative">
                <select 
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  className="w-full p-3.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl text-white focus:border-[#1CD05D] outline-none appearance-none transition-colors"
                >
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <svg className="absolute w-4 h-4 text-gray-500 transform -translate-y-1/2 pointer-events-none right-4 top-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>

            <div className="w-full md:w-32">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Quantity</label>
              <input 
                type="text" 
                value={newItemQuantity}
                onChange={(e) => setNewItemQuantity(e.target.value)}
                placeholder="e.g. 2 kg, 1 bag"
                className="w-full p-3.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl text-white focus:border-[#1CD05D] outline-none transition-colors"
              />
            </div>

            <button 
              type="submit"
              disabled={isAdding || !newItemName.trim()}
              className="w-full md:w-auto px-8 py-3.5 text-sm font-bold text-gray-900 bg-[#1CD05D] hover:bg-[#15b04d] rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed h-13 flex items-center justify-center gap-2"
            >
              {isAdding ? 'Saving...' : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                  Add Item
                </>
              )}
            </button>
          </form>
        </section>

        {/* Pantry List by Category */}
        {items.length === 0 ? (
          <div className="p-12 border border-dashed border-[#2A2A2A] rounded-2xl flex flex-col items-center justify-center text-center">
            <svg className="w-12 h-12 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
            <p className="text-xl font-bold text-white mb-2">Your pantry is empty</p>
            <p className="text-gray-500 max-w-sm">Use the quick add bar above to log ingredients you already have in your hostel or home.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {CATEGORIES.map((category) => {
              const categoryItems = groupedItems[category];
              if (!categoryItems || categoryItems.length === 0) return null;

              return (
                <div key={category} className="animate-in fade-in duration-500">
                  <div className="flex items-center gap-3 mb-4 border-b border-[#2A2A2A] pb-2">
                    <h2 className="text-lg font-bold text-white">{category}</h2>
                    <span className="px-2 py-0.5 text-xs font-bold bg-[#1A1A1A] text-gray-400 rounded-full">
                      {categoryItems.length}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryItems.map((item) => (
                      <div key={item.id} className="group bg-[#111111] border border-[#2A2A2A] hover:border-gray-600 transition-colors rounded-xl p-4 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-white text-base">{item.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{item.quantity}</p>
                        </div>
                        <button 
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-950/30 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Remove item"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
}