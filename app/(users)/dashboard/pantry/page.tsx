'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

interface PantryItem {
  id: string;
  name: string;
  category: string;
  quantity?: string; // For backward compatibility with older items
  amount?: number;   // Precise tracking
  unit?: string;     // Precise tracking
  updatedAt?: Date;
}

const CATEGORIES = ['Vegetables', 'Proteins', 'Grains & Pasta', 'Dairy', 'Spices', 'Snacks', 'Other'];
const UNITS = ['pieces', 'kg', 'g', 'lbs', 'liters', 'ml', 'bags', 'bottles', 'cans', 'cups', 'tbsp', 'tsp', 'packs', 'bunches'];

// Helper to reliably format the display text regardless of old or new data formats
function getDisplayQuantity(item: PantryItem): string {
  if (item.unit === 'mixed' && item.quantity) return item.quantity;
  if (item.amount !== undefined && item.unit) return `${item.amount} ${item.unit}`;
  return item.quantity || '1';
}

export default function PantryStockPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<PantryItem[]>([]);
  
  // Quick Add State
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Vegetables');
  const [newItemAmount, setNewItemAmount] = useState<number | string>('1');
  const [newItemUnit, setNewItemUnit] = useState('pieces');
  const [isAdding, setIsAdding] = useState(false);

  // Deduction Modal State
  const [deductItem, setDeductItem] = useState<PantryItem | null>(null);
  const [deductAmount, setDeductAmount] = useState<number | string>('');
  const [isDeducting, setIsDeducting] = useState(false);

  // --- FETCH PANTRY ITEMS ---
  const fetchPantryItems = async (uid: string) => {
    try {
      const q = query(collection(db, 'pantry'), where('userId', '==', uid));
      const querySnapshot = await getDocs(q);
      const fetchedItems: PantryItem[] = [];
      querySnapshot.forEach((document) => {
        fetchedItems.push({ id: document.id, ...document.data() } as PantryItem);
      });
      
      // Sort alphabetically
      fetchedItems.sort((a, b) => a.name.localeCompare(b.name));
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

  // --- ADD / UPDATE LOGIC ---
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newItemName.trim();
    const amountNum = Number(newItemAmount);
    
    if (!trimmedName || isNaN(amountNum) || amountNum <= 0) return;

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
        let updatedAmount = amountNum;
        let updatedUnit = newItemUnit;
        let fallbackQuantityString = '';

        // If they use the exact same unit (or it's a legacy string that magically matches)
        if (existingItem.unit === newItemUnit || existingItem.quantity?.includes(newItemUnit)) {
           // We can mathematically add them
           const currentAmount = existingItem.amount || Number(existingItem.quantity?.match(/^([\d.]+)/)?.[1]) || 0;
           updatedAmount = currentAmount + amountNum;
           fallbackQuantityString = `${updatedAmount} ${updatedUnit}`;
        } else {
           // Mismatched units (e.g., "1 bag" + "2 kg") - fallback to visual combination
           updatedUnit = 'mixed';
           fallbackQuantityString = `${getDisplayQuantity(existingItem)} + ${amountNum} ${newItemUnit}`;
        }
        
        const itemRef = doc(db, 'pantry', existingItem.id);
        await updateDoc(itemRef, {
          amount: updatedAmount,
          unit: updatedUnit,
          quantity: fallbackQuantityString,
          updatedAt: new Date()
        });

        // Update UI instantly
        setItems(items.map(item => 
          item.id === existingItem.id 
            ? { ...item, amount: updatedAmount, unit: updatedUnit, quantity: fallbackQuantityString } 
            : item
        ).sort((a, b) => a.name.localeCompare(b.name)));

      } else {
        // --- ADD BRAND NEW ITEM ---
        const newItemData = {
          userId: user.uid,
          name: trimmedName,
          category: newItemCategory,
          amount: amountNum,
          unit: newItemUnit,
          quantity: `${amountNum} ${newItemUnit}`, // Backup string
          addedAt: new Date()
        };

        const docRef = await addDoc(collection(db, 'pantry'), newItemData);
        
        // Update UI instantly
        setItems([{ id: docRef.id, ...newItemData }, ...items].sort((a, b) => a.name.localeCompare(b.name)));
      }
      
      // Reset form (keep category and unit for rapid data entry)
      setNewItemName('');
      setNewItemAmount('1');

    } catch (error) {
      console.error("Error saving item:", error);
      alert("Failed to save item. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  // --- DEDUCT LOGIC ---
  const handleDeductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountToDeduct = Number(deductAmount);
    
    if (!deductItem || isNaN(amountToDeduct) || amountToDeduct <= 0) return;

    setIsDeducting(true);
    try {
      const currentAmount = deductItem.amount || Number(deductItem.quantity?.match(/^([\d.]+)/)?.[1]) || 0;
      const newAmount = currentAmount - amountToDeduct;

      if (newAmount <= 0) {
        // If they deducted everything (or more than they had), just delete the item completely
        await deleteDoc(doc(db, 'pantry', deductItem.id));
        setItems(items.filter(i => i.id !== deductItem.id));
      } else {
        // Update the item with the new reduced amount
        const updatedUnit = deductItem.unit || '';
        const fallbackQuantityString = `${newAmount} ${updatedUnit}`.trim();
        
        await updateDoc(doc(db, 'pantry', deductItem.id), {
          amount: newAmount,
          quantity: fallbackQuantityString,
          updatedAt: new Date()
        });

        // Update UI state
        setItems(items.map(i => 
          i.id === deductItem.id 
            ? { ...i, amount: newAmount, quantity: fallbackQuantityString } 
            : i
        ));
      }

      // Close modal
      setDeductItem(null);
      setDeductAmount('');
    } catch (error) {
      console.error("Error deducting item:", error);
      alert("Failed to deduct item. Please try again.");
    } finally {
      setIsDeducting(false);
    }
  };

  // --- DELETE LOGIC ---
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
    <div className="min-h-screen bg-[#0A0A0A] text-white pb-20 lg:pb-8 relative">
      
      {/* --- DEDUCTION MODAL --- */}
      {deductItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6 md:p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-2">
               <h2 className="text-xl font-bold text-white">Use Ingredient</h2>
               <button onClick={() => setDeductItem(null)} className="text-gray-500 hover:text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            </div>
            <p className="text-sm text-gray-400 mb-6">
              How much <strong className="text-white">{deductItem.name}</strong> did you use? <br/>
              <span className="text-xs text-[#1CD05D]">Current stock: {getDisplayQuantity(deductItem)}</span>
            </p>
            
            <form onSubmit={handleDeductSubmit}>
              <div className="relative mb-6">
                <input 
                  type="number" 
                  step="0.01"
                  min="0.01"
                  value={deductAmount}
                  onChange={(e) => setDeductAmount(e.target.value)}
                  placeholder="Amount"
                  className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl pl-4 pr-16 py-3 text-sm text-white focus:border-yellow-500 outline-none transition-colors"
                  autoFocus
                  required
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-bold uppercase pointer-events-none">
                  {deductItem.unit || ''}
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={!deductAmount || isDeducting}
                className="w-full py-3 text-sm font-bold text-gray-900 bg-yellow-500 hover:bg-yellow-400 rounded-xl transition-colors disabled:opacity-50"
              >
                {isDeducting ? 'Updating...' : 'Subtract from Pantry'}
              </button>
            </form>
          </div>
        </div>
      )}

      <main className="p-6 md:p-8 max-w-300 mx-auto w-full animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-[#1CD05D] text-[10px] font-bold tracking-[0.15em] uppercase mb-2">Inventory Hub</p>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Your Pantry Stock</h1>
            <p className="text-gray-400 text-sm max-w-md leading-relaxed">
              Log the ingredients you already have so the AI can build cheaper meal plans around your existing stock.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-4">
             <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-4 min-w-30">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Total Items</p>
                <p className="text-2xl font-bold text-white">{items.length}</p>
             </div>
             <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-4 min-w-30">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Categories</p>
                <p className="text-2xl font-bold text-[#1CD05D]">{Object.keys(groupedItems).length}</p>
             </div>
          </div>
        </div>

        {/* Quick Add Form */}
        <section className="mb-12 bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6 shadow-lg shadow-[#1CD05D]/5">
          <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            
            <div className="md:col-span-4">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Ingredient Name</label>
              <input 
                type="text" 
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="e.g. Rice, Tomatoes, Chicken..."
                className="w-full p-3.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl text-white focus:border-[#1CD05D] outline-none transition-colors"
                required
              />
            </div>
            
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Category</label>
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

            <div className="grid grid-cols-2 gap-4 md:col-span-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Amount</label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0.01"
                  value={newItemAmount}
                  onChange={(e) => setNewItemAmount(e.target.value)}
                  className="w-full p-3.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl text-white focus:border-[#1CD05D] outline-none transition-colors"
                  required
                />
              </div>
              <div className="relative">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Unit</label>
                <select 
                  value={newItemUnit}
                  onChange={(e) => setNewItemUnit(e.target.value)}
                  className="w-full p-3.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl text-white focus:border-[#1CD05D] outline-none appearance-none transition-colors"
                >
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
                <svg className="absolute w-4 h-4 text-gray-500 transform -translate-y-1/2 pointer-events-none right-3 top-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>

            <div className="md:col-span-2">
              <button 
                type="submit"
                disabled={isAdding || !newItemName.trim()}
                className="w-full py-3.5 text-sm font-bold text-gray-900 bg-[#1CD05D] hover:bg-[#15b04d] rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isAdding ? <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div> : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                    Add
                  </>
                )}
              </button>
            </div>
            
          </form>
        </section>

        {/* Pantry List by Category */}
        {items.length === 0 ? (
          <div className="p-12 border border-dashed border-[#2A2A2A] rounded-2xl flex flex-col items-center justify-center text-center bg-[#111111]/30">
            <div className="w-16 h-16 bg-[#1A1A1A] rounded-full flex items-center justify-center mx-auto mb-4 text-[#1CD05D]">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
            </div>
            <p className="text-xl font-bold text-white mb-2">Your pantry is empty</p>
            <p className="text-gray-500 max-w-sm">Use the quick add bar above to log ingredients you already have in your hostel or home.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {CATEGORIES.map((category) => {
              const categoryItems = groupedItems[category];
              if (!categoryItems || categoryItems.length === 0) return null;

              return (
                <div key={category} className="animate-in fade-in duration-500">
                  <div className="flex items-center gap-3 mb-6 pb-2 border-b border-[#2A2A2A]">
                    <h2 className="text-lg font-bold text-white">{category}</h2>
                    <span className="px-2.5 py-0.5 text-xs font-bold bg-[#1A1A1A] text-[#1CD05D] rounded-full border border-[#2A2A2A]">
                      {categoryItems.length}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {categoryItems.map((item) => (
                      <div key={item.id} className="group bg-[#111111] border border-[#2A2A2A] hover:border-[#1CD05D]/50 transition-colors rounded-xl p-4 flex items-center justify-between shadow-lg">
                        <div className="flex items-center gap-3 overflow-hidden">
                           {/* Aesthetic glowing dot indicator */}
                           <div className="w-2.5 h-2.5 shrink-0 rounded-full bg-[#1A1A1A] group-hover:bg-[#1CD05D] group-hover:shadow-[0_0_8px_rgba(28,208,93,0.5)] transition-all"></div>
                           <div className="min-w-0">
                             <p className="font-bold text-white text-sm truncate">{item.name}</p>
                             <p className="text-xs font-bold text-gray-500 mt-0.5 tracking-wider uppercase">
                               {getDisplayQuantity(item)}
                             </p>
                           </div>
                        </div>
                        
                        {/* Actions Container */}
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          {/* Deduct Button */}
                          <button 
                            onClick={() => setDeductItem(item)}
                            className="p-1.5 text-gray-500 hover:text-yellow-500 bg-[#1A1A1A] rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                            title="Use some of this item"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                          </button>

                          {/* Delete Button */}
                          <button 
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 text-gray-500 hover:text-red-500 bg-[#1A1A1A] rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                            title="Delete completely"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
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