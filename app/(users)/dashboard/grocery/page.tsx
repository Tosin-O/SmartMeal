'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, orderBy, getDocs, updateDoc, deleteDoc, doc, writeBatch, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

interface GroceryItem {
  name: string;
  estimatedCost: number;
  isBought: boolean;
}

interface GroceryList {
  id: string;
  title?: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  items: GroceryItem[];
  status: 'active' | 'completed';
}

export default function GroceryListPage() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for all lists and the currently selected list
  const [lists, setLists] = useState<GroceryList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  
  // State for adding items to the selected list
  const [newItemName, setNewItemName] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // State for creating a brand new manual list
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [isCreatingList, setIsCreatingList] = useState(false);

  // --- FETCH LISTS ---
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }
      setUserId(user.uid);
      await fetchGroceryLists(user.uid);
    });
    return () => unsubscribe();
  }, [router]);

  const fetchGroceryLists = async (uid: string) => {
    try {
      const q = query(collection(db, 'users', uid, 'grocery_lists'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const fetchedLists: GroceryList[] = snapshot.docs.map(d => {
        const data = d.data();
        
        // Ensure items are sorted properly (unbought first)
        const sortedItems = (data.items || []).sort((a: GroceryItem, b: GroceryItem) => {
          if (a.isBought === b.isBought) return a.name.localeCompare(b.name);
          return a.isBought ? 1 : -1;
        });

        return {
          id: d.id,
          title: data.title,
          startDate: data.startDate?.toDate() || new Date(),
          endDate: data.endDate?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          items: sortedItems,
          status: data.status || 'active'
        };
      });
      
      setLists(fetchedLists);
    } catch (error) {
      console.error("Error fetching grocery lists:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- NEW: CREATE MANUAL LIST ---
  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !newListTitle.trim()) return;

    setIsCreatingList(true);
    try {
      const today = new Date();
      const newListData = {
        title: newListTitle.trim(),
        startDate: today,
        endDate: today, // Manual lists might just default to today
        createdAt: serverTimestamp(),
        items: [],
        status: 'active'
      };

      const docRef = await addDoc(collection(db, 'users', userId, 'grocery_lists'), newListData);
      
      // Optimistically add to UI
      const newList: GroceryList = {
        id: docRef.id,
        title: newListTitle.trim(),
        startDate: today,
        endDate: today,
        createdAt: today,
        items: [],
        status: 'active'
      };

      setLists([newList, ...lists]);
      setNewListTitle('');
      setIsCreateModalOpen(false);
      setSelectedListId(docRef.id); // Auto-open the new list
    } catch (error) {
      console.error("Error creating list:", error);
      alert("Failed to create list.");
    } finally {
      setIsCreatingList(false);
    }
  };

  // --- LIST LEVEL ACTIONS ---
  const toggleListStatus = async (e: React.MouseEvent | null, listId: string, currentStatus: string) => {
    if (e) e.stopPropagation(); 
    if (!userId) return;

    const newStatus = currentStatus === 'completed' ? 'active' : 'completed';
    
    // Optimistic Update
    setLists(prev => prev.map(l => l.id === listId ? { ...l, status: newStatus } : l));

    try {
      await updateDoc(doc(db, 'users', userId, 'grocery_lists', listId), { status: newStatus });
    } catch (error) {
      console.error("Error updating list status:", error);
      fetchGroceryLists(userId); // Rollback on fail
    }
  };

  const deleteList = async (e: React.MouseEvent, listId: string) => {
    e.stopPropagation();
    if (!userId) return;
    
    const confirmDelete = confirm("Are you sure you want to delete this list?");
    if (!confirmDelete) return;

    setLists(prev => prev.filter(l => l.id !== listId));
    if (selectedListId === listId) setSelectedListId(null);
    
    try {
      await deleteDoc(doc(db, 'users', userId, 'grocery_lists', listId));
    } catch (error) {
      console.error("Error deleting list:", error);
      fetchGroceryLists(userId);
    }
  };

  // --- ITEM LEVEL ACTIONS (Inside a specific list) ---
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !selectedListId || !newItemName.trim()) return;

    setIsAddingItem(true);
    try {
      const list = lists.find(l => l.id === selectedListId);
      if (!list) return;

      const newItem: GroceryItem = { name: newItemName.trim(), estimatedCost: 0, isBought: false };
      const updatedItems = [newItem, ...list.items]; // Add to top

      setLists(prev => prev.map(l => l.id === selectedListId ? { ...l, items: updatedItems } : l));
      setNewItemName('');

      await updateDoc(doc(db, 'users', userId, 'grocery_lists', selectedListId), { items: updatedItems });
    } catch (error) {
      console.error("Error adding item:", error);
    } finally {
      setIsAddingItem(false);
    }
  };

  const toggleItemStatus = async (itemName: string) => {
    if (!userId || !selectedListId) return;

    const list = lists.find(l => l.id === selectedListId);
    if (!list) return;

    const updatedItems = list.items.map(i => 
      i.name === itemName ? { ...i, isBought: !i.isBought } : i
    ).sort((a, b) => {
      if (a.isBought === b.isBought) return a.name.localeCompare(b.name);
      return a.isBought ? 1 : -1;
    });

    setLists(prev => prev.map(l => l.id === selectedListId ? { ...l, items: updatedItems } : l));

    try {
      await updateDoc(doc(db, 'users', userId, 'grocery_lists', selectedListId), { items: updatedItems });
    } catch (error) {
      console.error("Error toggling item:", error);
      fetchGroceryLists(userId);
    }
  };

  const handleDeleteItem = async (itemName: string) => {
    if (!userId || !selectedListId) return;

    const list = lists.find(l => l.id === selectedListId);
    if (!list) return;

    const updatedItems = list.items.filter(i => i.name !== itemName);
    setLists(prev => prev.map(l => l.id === selectedListId ? { ...l, items: updatedItems } : l));

    try {
      await updateDoc(doc(db, 'users', userId, 'grocery_lists', selectedListId), { items: updatedItems });
    } catch (error) {
      console.error("Error deleting item:", error);
      fetchGroceryLists(userId);
    }
  };

  // Sync to Pantry Logic
  const handleSyncToPantry = async () => {
    if (!userId || !selectedListId) return;
    setIsSyncing(true);

    const list = lists.find(l => l.id === selectedListId);
    if (!list) return;

    const boughtItems = list.items.filter(i => i.isBought);
    const unboughtItems = list.items.filter(i => !i.isBought);

    if (boughtItems.length === 0) {
      setIsSyncing(false);
      return;
    }

    try {
      const batch = writeBatch(db);

      boughtItems.forEach(item => {
        const pantryRef = doc(collection(db, 'pantry'));
        batch.set(pantryRef, {
          userId,
          name: item.name,
          category: 'Uncategorized', 
          quantity: '1',
          addedAt: new Date()
        });
      });

      const listRef = doc(db, 'users', userId, 'grocery_lists', selectedListId);
      batch.update(listRef, { items: unboughtItems });

      await batch.commit();

      setLists(prev => prev.map(l => l.id === selectedListId ? { ...l, items: unboughtItems } : l));
      alert(`Successfully moved ${boughtItems.length} items to your Pantry!`);

    } catch (error) {
      console.error("Error syncing to pantry:", error);
      alert("Failed to sync items to pantry.");
    } finally {
      setIsSyncing(false);
    }
  };

  // --- HELPERS ---
  const formatListTitle = (list: GroceryList) => {
    if (list.title) return list.title;
    const start = list.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const end = list.endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `Meal Plan: ${start} - ${end}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#1CD05D] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const selectedList = lists.find(l => l.id === selectedListId);
  const activeListsCount = lists.filter(l => l.status === 'active').length;
  const totalPendingItems = lists.filter(l => l.status === 'active').reduce((acc, l) => acc + l.items.filter(i => !i.isBought).length, 0);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pb-20 lg:pb-8 relative">
      
      {/* --- CREATE NEW LIST MODAL --- */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-white mb-2">Create New List</h2>
            <p className="text-sm text-gray-400 mb-6">Create a custom shopping list separate from your meal plans.</p>
            
            <form onSubmit={handleCreateList}>
              <input 
                type="text" 
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                placeholder="e.g., Weekend Party, Office Snacks..."
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm text-white focus:border-[#1CD05D] outline-none transition-colors mb-6"
                autoFocus
              />
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-3 text-sm font-bold text-gray-400 bg-[#1A1A1A] rounded-xl hover:bg-[#2A2A2A] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={!newListTitle.trim() || isCreatingList}
                  className="flex-1 py-3 text-sm font-bold text-gray-900 bg-[#1CD05D] hover:bg-[#15b04d] rounded-xl transition-colors disabled:opacity-50"
                >
                  {isCreatingList ? 'Creating...' : 'Create List'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <main className="p-6 md:p-8 max-w-300 mx-auto w-full animate-in fade-in duration-500">
        
        {/* === VIEW 1: ALL LISTS OVERVIEW === */}
        {!selectedListId && (
          <>
            {/* Header & Quick Action */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <p className="text-[#1CD05D] text-[10px] font-bold tracking-[0.15em] uppercase mb-2">Supermarket Hub</p>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Shopping Lists</h1>
                <p className="text-gray-400 text-sm max-w-md leading-relaxed">
                  Manage all your grocery needs. Sync items directly to your pantry when you&apos;re done shopping.
                </p>
              </div>
              
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-[#1CD05D] text-gray-900 px-6 py-3.5 rounded-xl text-sm font-bold hover:bg-[#15b04d] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#1CD05D]/20"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Create New List
              </button>
            </div>

            {/* Aesthetic Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
               <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-5 flex flex-col justify-center">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Lists</p>
                  <p className="text-3xl font-bold text-white">{lists.length}</p>
               </div>
               <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-5 flex flex-col justify-center">
                  <p className="text-[10px] font-bold text-[#1CD05D] uppercase tracking-widest mb-1">Active Lists</p>
                  <p className="text-3xl font-bold text-white">{activeListsCount}</p>
               </div>
               <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-5 flex flex-col justify-center col-span-2 md:col-span-2">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Pending Items</p>
                  <div className="flex items-end gap-3">
                    <p className="text-3xl font-bold text-white">{totalPendingItems}</p>
                    <p className="text-sm text-gray-500 mb-1 leading-none">items across all active lists</p>
                  </div>
               </div>
            </div>

            {lists.length === 0 ? (
               <div className="border border-dashed border-[#2A2A2A] rounded-2xl p-12 text-center bg-[#111111]/30">
                 <div className="w-12 h-12 bg-[#1A1A1A] rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                 </div>
                 <p className="text-white text-base font-bold mb-1">No shopping lists found</p>
                 <p className="text-gray-500 text-sm max-w-sm mx-auto">Create a new manual list or generate a meal plan to automatically build your groceries here.</p>
               </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {lists.map(list => {
                  const totalCost = list.items.reduce((sum, item) => sum + (Number(item.estimatedCost) || 0), 0);
                  const completedCount = list.items.filter(i => i.isBought).length;
                  const displayTitle = formatListTitle(list);

                  return (
                    <div 
                      key={list.id} 
                      onClick={() => setSelectedListId(list.id)} 
                      className={`bg-[#111111] border rounded-2xl p-6 cursor-pointer transition-all duration-300 flex flex-col h-full group ${list.status === 'completed' ? 'border-[#2A2A2A] opacity-60' : 'border-[#2A2A2A] hover:border-[#1CD05D]/50 shadow-lg hover:shadow-[#1CD05D]/5'}`}
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-2.5 h-2.5 rounded-full ${list.status === 'completed' ? 'bg-gray-600' : 'bg-[#1CD05D] shadow-[0_0_8px_rgba(28,208,93,0.5)]'}`}></div>
                            <h3 className={`font-bold text-lg line-clamp-1 pr-4 ${list.status === 'completed' ? 'text-gray-400 line-through' : 'text-white'}`}>
                              {displayTitle}
                            </h3>
                          </div>
                          <p className="text-gray-500 text-xs pl-4 flex items-center gap-2">
                            <span>{list.items.length} items</span>
                            <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                            <span className="font-bold">₦{totalCost.toLocaleString()}</span>
                          </p>
                        </div>
                        <button onClick={(e) => deleteList(e, list.id)} className="text-gray-600 hover:text-red-500 bg-[#1A1A1A] p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100 shrink-0">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>

                      {/* Mini Progress Bar */}
                      <div className="mb-6 pl-4">
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Progress</span>
                           <span className="text-[10px] font-bold text-gray-400">{list.items.length > 0 ? Math.round((completedCount / list.items.length) * 100) : 0}%</span>
                        </div>
                        <div className="w-full bg-[#1A1A1A] h-1.5 rounded-full overflow-hidden">
                           <div className={`h-full rounded-full transition-all duration-500 ${list.status === 'completed' ? 'bg-gray-500' : 'bg-[#1CD05D]'}`} style={{ width: `${list.items.length > 0 ? (completedCount / list.items.length) * 100 : 0}%` }}></div>
                        </div>
                      </div>
                      
                      <div className="mt-auto">
                        <button 
                          onClick={(e) => toggleListStatus(e, list.id, list.status)}
                          className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors ${list.status === 'completed' ? 'text-gray-400 bg-[#1A1A1A] hover:bg-[#2A2A2A]' : 'text-[#1CD05D] bg-[#1CD05D]/10 hover:bg-[#1CD05D] hover:text-gray-900 border border-[#1CD05D]/30'}`}
                        >
                          {list.status === 'completed' ? 'Reopen List' : 'Mark as Complete'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}


        {/* === VIEW 2: SPECIFIC LIST DETAILS === */}
        {selectedListId && selectedList && (
          <div className="animate-in slide-in-from-right-4 duration-300 max-w-3xl mx-auto">
            
            <button onClick={() => setSelectedListId(null)} className="text-[#1CD05D] text-sm font-bold flex items-center gap-2 mb-8 hover:underline w-max">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to all lists
            </button>

            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className={`text-3xl font-bold ${selectedList.status === 'completed' ? 'text-gray-500 line-through' : 'text-white'}`}>
                    {formatListTitle(selectedList)}
                  </h1>
                  {selectedList.status === 'completed' && (
                    <span className="px-2 py-1 text-[10px] font-bold text-gray-400 bg-[#1A1A1A] rounded uppercase tracking-wider">Completed</span>
                  )}
                </div>
                <p className="text-gray-400 text-sm">
                  Created on {selectedList.createdAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              
              <div className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-4 min-w-48 text-right">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Estimated Total</p>
                <p className="text-2xl font-bold text-[#1CD05D]">
                   ₦{selectedList.items.reduce((sum, item) => sum + (Number(item.estimatedCost) || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>

            {/* NEW: Action Row for the specific list */}
            <div className="flex flex-wrap gap-3 mb-8">
              <button 
                onClick={() => toggleListStatus(null, selectedList.id, selectedList.status)}
                className={`px-6 py-3 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 flex-1 md:flex-none justify-center ${selectedList.status === 'completed' ? 'text-gray-300 bg-[#2A2A2A] hover:bg-[#333]' : 'text-gray-900 bg-[#1CD05D] hover:bg-[#15b04d]'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {selectedList.status === 'completed' ? 'Reopen List' : 'Mark List Complete'}
              </button>
              
              <button 
                onClick={handleSyncToPantry}
                disabled={isSyncing || selectedList.items.filter(i => i.isBought).length === 0}
                className="px-6 py-3 rounded-xl text-sm font-bold text-[#1CD05D] bg-[#13251A] hover:bg-[#1CD05D] hover:text-gray-900 transition-colors flex items-center gap-2 flex-1 md:flex-none justify-center disabled:opacity-50"
              >
                {isSyncing ? 'Syncing...' : 'Sync Bought Items to Pantry'}
                {!isSyncing && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>}
              </button>
            </div>

            {/* Quick Add Bar */}
            <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-4 mb-8 flex flex-col sm:flex-row gap-3 shadow-lg">
              <form onSubmit={handleAddItem} className="flex-1 flex gap-3">
                <input 
                  type="text" 
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="Add milk, eggs, paper towels..."
                  disabled={selectedList.status === 'completed'}
                  className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm text-white focus:border-[#1CD05D] outline-none transition-colors disabled:opacity-50"
                />
                <button 
                  type="submit"
                  disabled={isAddingItem || !newItemName.trim() || selectedList.status === 'completed'}
                  className="bg-[#1CD05D] text-gray-900 px-6 py-3 rounded-xl text-sm font-bold hover:bg-[#15b04d] transition-all disabled:opacity-50 shrink-0"
                >
                  Add Item
                </button>
              </form>
            </div>

            {/* List Items Container */}
            <div className="space-y-8">
              
              {/* Active Items */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  To Buy <span className="bg-[#1A1A1A] text-gray-400 px-2 py-0.5 rounded-full">{selectedList.items.filter(i => !i.isBought).length}</span>
                </h3>
                
                {selectedList.items.filter(i => !i.isBought).length === 0 ? (
                  <div className="border border-dashed border-[#2A2A2A] rounded-2xl p-8 text-center bg-[#111111]/50">
                    <p className="text-gray-500 text-sm font-medium">No items left to buy! You&apos;re all set.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedList.items.filter(i => !i.isBought).map(item => (
                      <div key={item.name} className="group bg-[#111111] border border-[#2A2A2A] hover:border-[#1CD05D]/50 rounded-xl p-4 flex items-center justify-between transition-colors">
                        <div className="flex items-center gap-4 cursor-pointer" onClick={() => toggleItemStatus(item.name)}>
                          {/* Aesthetic Checkbox derived from vibes */}
                          <div className="w-5 h-5 rounded border-2 border-gray-600 flex items-center justify-center group-hover:border-[#1CD05D] transition-colors"></div>
                          <span className="font-bold text-white text-sm select-none">{item.name}</span>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          {item.estimatedCost > 0 ? (
                             <span className="text-xs font-bold text-gray-400">₦{item.estimatedCost.toLocaleString()}</span>
                          ) : (
                             <span className="text-xs font-bold text-gray-600">Price TBD</span>
                          )}
                          <button onClick={() => handleDeleteItem(item.name)} className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-[#1A1A1A] rounded">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Completed Items */}
              {selectedList.items.filter(i => i.isBought).length > 0 && (
                <div className="pt-6 border-t border-[#2A2A2A]">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    In Cart <span className="bg-[#1A1A1A] text-[#1CD05D] px-2 py-0.5 rounded-full">{selectedList.items.filter(i => i.isBought).length}</span>
                  </h3>

                  <div className="space-y-2 opacity-60">
                    {selectedList.items.filter(i => i.isBought).map(item => (
                      <div key={item.name} className="group bg-[#111111] border border-[#2A2A2A] rounded-xl p-4 flex items-center justify-between transition-colors">
                        <div className="flex items-center gap-4 cursor-pointer" onClick={() => toggleItemStatus(item.name)}>
                          {/* Aesthetic Checked state */}
                          <div className="w-5 h-5 rounded border-2 border-[#1CD05D] bg-[#1CD05D] flex items-center justify-center transition-colors">
                            <svg className="w-3 h-3 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                          </div>
                          <span className="font-bold text-gray-400 text-sm line-through decoration-gray-500 select-none">{item.name}</span>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          {item.estimatedCost > 0 ? (
                             <span className="text-xs font-bold text-gray-600 line-through">₦{item.estimatedCost.toLocaleString()}</span>
                          ) : (
                             <span className="text-xs font-bold text-gray-600 line-through">Price TBD</span>
                          )}
                          <button onClick={() => handleDeleteItem(item.name)} className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-[#1A1A1A] rounded">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </main>
    </div>
  );
}