'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

interface GroceryItem {
  id: string;
  name: string;
  estimatedCost: number;
  isBought: boolean;
  category?: string;
}

export default function GroceryListPage() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<GroceryItem[]>([]);
  
  const [newItemName, setNewItemName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // --- FETCH ITEMS ---
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }
      setUserId(user.uid);
      await fetchGroceryList(user.uid);
    });
    return () => unsubscribe();
  }, [router]);

  const fetchGroceryList = async (uid: string) => {
    try {
      const q = query(collection(db, 'grocery_list'), where('userId', '==', uid));
      const snapshot = await getDocs(q);
      const fetchedItems: GroceryItem[] = [];
      snapshot.forEach(doc => fetchedItems.push({ id: doc.id, ...doc.data() } as GroceryItem));
      
      // Sort: Unbought items first, then alphabetical
      fetchedItems.sort((a, b) => {
        if (a.isBought === b.isBought) return a.name.localeCompare(b.name);
        return a.isBought ? 1 : -1;
      });
      
      setItems(fetchedItems);
    } catch (error) {
      console.error("Error fetching grocery list:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- ACTIONS ---
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !newItemName.trim()) return;

    setIsAdding(true);
    try {
      const newItemData = {
        userId,
        name: newItemName.trim(),
        estimatedCost: 0,
        isBought: false,
        addedAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'grocery_list'), newItemData);
      setItems([{ id: docRef.id, ...newItemData }, ...items]);
      setNewItemName('');
    } catch (error) {
      console.error("Error adding item:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const toggleItemStatus = async (item: GroceryItem) => {
    // Optimistic UI update
    const updatedItems = items.map(i => 
      i.id === item.id ? { ...i, isBought: !i.isBought } : i
    ).sort((a, b) => {
      if (a.isBought === b.isBought) return a.name.localeCompare(b.name);
      return a.isBought ? 1 : -1;
    });
    setItems(updatedItems);

    try {
      const itemRef = doc(db, 'grocery_list', item.id);
      await updateDoc(itemRef, { isBought: !item.isBought });
    } catch (error) {
      console.error("Error toggling item:", error);
      // Rollback on failure
      fetchGroceryList(userId!);
    }
  };

  const handleDeleteItem = async (id: string) => {
    setItems(items.filter(i => i.id !== id));
    try {
      await deleteDoc(doc(db, 'grocery_list', id));
    } catch (error) {
      console.error("Error deleting item:", error);
      fetchGroceryList(userId!);
    }
  };

  // The Killer Feature: Move bought items straight to the pantry
  const handleSyncToPantry = async () => {
    if (!userId) return;
    setIsSyncing(true);

    const boughtItems = items.filter(i => i.isBought);
    if (boughtItems.length === 0) {
      setIsSyncing(false);
      return;
    }

    try {
      const batch = writeBatch(db);

      boughtItems.forEach(item => {
        // 1. Add to Pantry Collection
        const pantryRef = doc(collection(db, 'pantry'));
        batch.set(pantryRef, {
          userId,
          name: item.name,
          category: 'Uncategorized', // User can organize later
          quantity: '1',
          addedAt: new Date()
        });

        // 2. Remove from Grocery List Collection
        const groceryRef = doc(db, 'grocery_list', item.id);
        batch.delete(groceryRef);
      });

      await batch.commit();

      // Remove synced items from local UI state
      setItems(items.filter(i => !i.isBought));
      alert(`Successfully moved ${boughtItems.length} items to your Pantry!`);

    } catch (error) {
      console.error("Error syncing to pantry:", error);
      alert("Failed to sync items to pantry.");
    } finally {
      setIsSyncing(false);
    }
  };

  // --- RENDER HELPERS ---
  const activeItems = items.filter(i => !i.isBought);
  const completedItems = items.filter(i => i.isBought);
  const totalCost = items.reduce((sum, item) => sum + (Number(item.estimatedCost) || 0), 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#1CD05D] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pb-20 lg:pb-8">
      <main className="p-6 md:p-8 max-w-[800px] mx-auto w-full animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-[#1CD05D] text-[10px] font-bold tracking-[0.15em] uppercase mb-2">Supermarket Run</p>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Grocery List</h1>
            <p className="text-gray-400 text-sm max-w-md leading-relaxed">
              Items generated from your meal plans and your manual additions. Check them off as you shop.
            </p>
          </div>
          
          <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-4 min-w-[200px]">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Estimated List Total</p>
            <p className="text-2xl font-bold text-[#1CD05D]">₦{totalCost.toLocaleString()}</p>
          </div>
        </div>

        {/* Quick Add Bar */}
        <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-4 mb-8 flex flex-col sm:flex-row gap-3 shadow-lg">
          <form onSubmit={handleAddItem} className="flex-1 flex gap-3">
            <input 
              type="text" 
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Add milk, eggs, paper towels..."
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm text-white focus:border-[#1CD05D] outline-none transition-colors"
            />
            <button 
              type="submit"
              disabled={isAdding || !newItemName.trim()}
              className="bg-[#1CD05D] text-gray-900 px-6 py-3 rounded-xl text-sm font-bold hover:bg-[#15b04d] transition-all disabled:opacity-50 shrink-0"
            >
              Add Item
            </button>
          </form>
        </div>

        {/* List Container */}
        <div className="space-y-8">
          
          {/* Active Items */}
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              To Buy <span className="bg-[#1A1A1A] text-gray-400 px-2 py-0.5 rounded-full">{activeItems.length}</span>
            </h3>
            
            {activeItems.length === 0 ? (
              <div className="border border-dashed border-[#2A2A2A] rounded-2xl p-8 text-center bg-[#111111]/50">
                <p className="text-gray-500 text-sm font-medium">No items left to buy! You're all set.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {activeItems.map(item => (
                  <div key={item.id} className="group bg-[#111111] border border-[#2A2A2A] hover:border-gray-600 rounded-xl p-4 flex items-center justify-between transition-colors">
                    <div className="flex items-center gap-4 cursor-pointer" onClick={() => toggleItemStatus(item)}>
                      <div className="w-5 h-5 rounded border-2 border-gray-600 flex items-center justify-center group-hover:border-[#1CD05D] transition-colors"></div>
                      <span className="font-bold text-white text-sm select-none">{item.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {item.estimatedCost > 0 && <span className="text-xs font-bold text-gray-500">₦{item.estimatedCost}</span>}
                      <button onClick={() => handleDeleteItem(item.id)} className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Completed Items */}
          {completedItems.length > 0 && (
            <div className="pt-6 border-t border-[#2A2A2A]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  In Cart <span className="bg-[#1A1A1A] text-[#1CD05D] px-2 py-0.5 rounded-full">{completedItems.length}</span>
                </h3>
                <button 
                  onClick={handleSyncToPantry}
                  disabled={isSyncing}
                  className="text-xs font-bold text-[#1CD05D] bg-[#13251A] hover:bg-[#1CD05D] hover:text-gray-900 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  {isSyncing ? 'Syncing...' : 'Sync to Pantry'}
                  {!isSyncing && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
                </button>
              </div>

              <div className="space-y-2 opacity-60">
                {completedItems.map(item => (
                  <div key={item.id} className="group bg-[#111111] border border-[#2A2A2A] rounded-xl p-4 flex items-center justify-between transition-colors">
                    <div className="flex items-center gap-4 cursor-pointer" onClick={() => toggleItemStatus(item)}>
                      <div className="w-5 h-5 rounded border-2 border-[#1CD05D] bg-[#1CD05D] flex items-center justify-center transition-colors">
                        <svg className="w-3 h-3 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <span className="font-bold text-gray-400 text-sm line-through decoration-gray-500 select-none">{item.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {item.estimatedCost > 0 && <span className="text-xs font-bold text-gray-600 line-through">₦{item.estimatedCost}</span>}
                      <button onClick={() => handleDeleteItem(item.id)} className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}