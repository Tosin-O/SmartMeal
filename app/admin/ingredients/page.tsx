'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, setDoc, updateDoc, doc, deleteDoc, writeBatch } from 'firebase/firestore'; // Added writeBatch
import { db } from '@/lib/firebase';

interface Ingredient {
  id: string;
  name: string;
  category: string;
  unitPrice: number;
  baseUnit: string;
  status?: 'Stable' | 'Spiking' | 'Out of Season';
  lastUpdated?: string;
}

export default function IngredientDatabase() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Drawer & Interaction State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Ingredient>>({});

  // Bulk Edit State
  const [bulkCategory, setBulkCategory] = useState('All Categories');
  const [bulkOperation, setBulkOperation] = useState('Increase by (%)');
  const [bulkPercentage, setBulkPercentage] = useState('5.0');
  const [isBulkSaving, setIsBulkSaving] = useState(false);

  const fetchIngredients = useCallback(async () => {
    setIsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'market_ingredients'));
      const fetchedItems: Ingredient[] = [];
      
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        fetchedItems.push({
          id: docSnap.id,
          name: data.name || 'Unknown Ingredient',
          category: data.category || 'Uncategorized',
          unitPrice: data.unitPrice || 0,
          baseUnit: data.baseUnit || 'kg',
          status: data.status || (Math.random() > 0.8 ? 'Spiking' : 'Stable'), 
          lastUpdated: 'Today', 
        });
      });

      fetchedItems.sort((a, b) => a.name.localeCompare(b.name));
      setIngredients(fetchedItems);
    } catch (error) {
      console.error("Error fetching ingredients:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients]);

  // --- Interaction Handlers ---

  const openCreateDrawer = () => {
    setFormData({
      name: '', category: 'Grains', unitPrice: 0, baseUnit: '1kg', status: 'Stable'
    });
    setDrawerMode('create');
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (item: Ingredient) => {
    setSelectedIngredient(item);
    setFormData(item);
    setDrawerMode('edit');
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => { setSelectedIngredient(null); setFormData({}); }, 300);
  };

  const generateIngredientId = (name: string) => {
    if (!name) return `ing_${Date.now()}`;
    const formattedName = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    return `ing_${formattedName}`;
  };

  // --- CRUD Handlers ---

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (drawerMode === 'create') {
        const customId = generateIngredientId(formData.name || 'unknown');
        await setDoc(doc(db, 'market_ingredients', customId), {
          ...formData,
          ingredientId: customId
        });
      } else if (drawerMode === 'edit' && selectedIngredient) {
        await updateDoc(doc(db, 'market_ingredients', selectedIngredient.id), formData);
      }
      await fetchIngredients();
      closeDrawer();
    } catch (error) {
      console.error("Error saving ingredient:", error);
      alert("Failed to save ingredient. Check console for details.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedIngredient) return;
    if (confirm(`Are you sure you want to delete ${selectedIngredient.name}? This might break recipes relying on it.`)) {
      setIsSaving(true);
      try {
        await deleteDoc(doc(db, 'market_ingredients', selectedIngredient.id));
        await fetchIngredients();
        closeDrawer();
      } catch (error) {
        console.error("Error deleting ingredient:", error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  // --- BULK UPDATE HANDLER ---
  const handleBulkUpdate = async () => {
    const val = Number(bulkPercentage);
    if (isNaN(val) || val <= 0) {
      alert("Please enter a valid number greater than 0.");
      return;
    }

    if (!confirm(`Are you sure you want to apply this change to ${bulkCategory}?`)) return;

    setIsBulkSaving(true);
    try {
      const batch = writeBatch(db);
      let updateCount = 0;

      ingredients.forEach(ing => {
        if (bulkCategory === 'All Categories' || ing.category === bulkCategory) {
          let newPrice = ing.unitPrice;

          if (bulkOperation === 'Increase by (%)') {
            newPrice = ing.unitPrice * (1 + val / 100);
          } else if (bulkOperation === 'Decrease by (%)') {
            newPrice = ing.unitPrice * (1 - val / 100);
          } else if (bulkOperation === 'Set Flat Rate (₦)') {
            newPrice = val;
          }

          newPrice = Math.round(newPrice); // Keep currency whole numbers

          if (newPrice !== ing.unitPrice) {
            const ref = doc(db, 'market_ingredients', ing.id);
            batch.update(ref, { unitPrice: newPrice });
            updateCount++;
          }
        }
      });

      if (updateCount > 0) {
        await batch.commit();
        alert(`Successfully updated prices for ${updateCount} ingredients!`);
        await fetchIngredients();
      } else {
        alert("No ingredients found in that category to update.");
      }
    } catch (error) {
      console.error("Bulk update error:", error);
      alert("Failed to perform bulk update.");
    } finally {
      setIsBulkSaving(false);
    }
  };

  const filteredIngredients = ingredients.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-400 mx-auto w-full animate-in fade-in duration-500 relative overflow-hidden">
      
      {/* 1. Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-gray-500 uppercase">
          <span>ADMIN</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="text-gray-300">INGREDIENT DATABASE</span>
        </div>
        
        <button onClick={openCreateDrawer} className="shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-gray-900 transition-colors rounded-lg bg-[#1CD05D] hover:bg-[#15b04d]">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
          New Ingredient
        </button>
      </header>

      {/* 2. Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-[#111111] border border-[#2A2A2A] rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-bold tracking-wider text-gray-500 uppercase">TOTAL INGREDIENTS</h3>
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-extrabold text-white">{isLoading ? '...' : ingredients.length}</p>
            <span className="px-2 py-1 text-xs font-bold text-[#1CD05D] bg-[#13251A] rounded-md">+ Active</span>
          </div>
        </div>

        <div className="p-6 bg-[#111111] border border-[#2A2A2A] rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-bold tracking-wider text-gray-500 uppercase">PRICE FLUCTUATIONS (24H)</h3>
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-extrabold text-white">{ingredients.filter(i => i.status === 'Spiking').length} Items</p>
            <span className="px-2 py-1 text-xs font-bold text-red-400 bg-red-950/30 rounded-md">Spiking</span>
          </div>
        </div>

        <div className="p-6 bg-[#111111] border border-[#2A2A2A] rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-bold tracking-wider text-gray-500 uppercase">SEASONAL STATUS</h3>
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-extrabold text-white">85%</p>
            <span className="px-2 py-1 text-xs font-bold text-gray-400 bg-[#1A1A1A] border border-[#2A2A2A] rounded-md">IN SEASON</span>
          </div>
        </div>
      </div>

      {/* 3. Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column (Table) */}
        <div className="xl:col-span-2">
          <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl overflow-hidden flex flex-col h-full">
            
            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A2A2A]">
              <h2 className="text-sm font-bold tracking-wider text-white uppercase">INGREDIENT INVENTORY & PRICING</h2>
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <input 
                  type="search" 
                  placeholder="Search items..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-2 pl-10 pr-4 text-sm rounded-lg outline-none transition-colors border text-white bg-[#1A1A1A] border-[#2A2A2A] placeholder-gray-500 focus:border-[#1CD05D]" 
                />
              </div>
            </div>

            <div className="overflow-x-auto max-h-150 overflow-y-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] font-bold tracking-widest text-gray-500 uppercase bg-[#161616] border-b border-[#2A2A2A] sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4">ITEM</th>
                    <th className="px-6 py-4">CATEGORY</th>
                    <th className="px-6 py-4">CURRENT UNIT PRICE</th>
                    <th className="px-6 py-4 text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A2A2A]">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex justify-center"><div className="w-6 h-6 border-2 border-[#1CD05D] border-t-transparent rounded-full animate-spin"></div></div>
                      </td>
                    </tr>
                  ) : filteredIngredients.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                        No ingredients found.
                      </td>
                    </tr>
                  ) : (
                    filteredIngredients.map((item) => (
                      <tr 
                        key={item.id} 
                        onClick={() => openEditDrawer(item)}
                        className="hover:bg-[#1A1A1A] transition-colors cursor-pointer group"
                      >
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg flex items-center justify-center shrink-0 text-gray-500 group-hover:border-gray-500 transition-colors">
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          </div>
                          <span className="font-bold text-white group-hover:text-[#1CD05D] transition-colors">{item.name}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                            item.category === 'Grains' || item.category === 'Tubers' ? 'bg-blue-950/30 text-blue-400 border-blue-900/50' : 
                            item.category === 'Oils' ? 'bg-orange-950/30 text-orange-400 border-orange-900/50' :
                            item.category === 'Vegetables' || item.category === 'Produce' ? 'bg-green-950/30 text-green-400 border-green-900/50' :
                            item.category === 'Proteins' ? 'bg-red-950/30 text-red-400 border-red-900/50' :
                            'bg-indigo-950/30 text-indigo-400 border-indigo-900/50'
                          }`}>
                            {item.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-white">₦{item.unitPrice.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">/ {item.baseUnit}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {item.status === 'Stable' && <span className="inline-flex px-3 py-1 text-xs font-bold text-[#1CD05D] bg-[#13251A] border border-[#1CD05D]/30 rounded-full">Stable</span>}
                          {item.status === 'Spiking' && <span className="inline-flex px-3 py-1 text-xs font-bold text-red-400 bg-red-950/30 border border-red-900/50 rounded-full">Spiking</span>}
                          {item.status === 'Out of Season' && <span className="inline-flex px-3 py-1 text-xs font-bold text-gray-400 bg-[#1A1A1A] border border-[#2A2A2A] rounded-full">Out of Season</span>}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-[#2A2A2A] text-sm text-gray-500 mt-auto text-center">
              Total database entries: {ingredients.length}
            </div>
          </div>
        </div>

        {/* Right Column (Bulk Update Logic - NOW FULLY FUNCTIONAL) */}
        <div className="hidden xl:block">
          <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-8">
              <svg className="w-5 h-5 text-[#1CD05D]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              <h2 className="text-lg font-bold text-white">Bulk Price Adjustment</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-2">SELECT CATEGORY</label>
                <div className="relative">
                  <select 
                    value={bulkCategory}
                    onChange={(e) => setBulkCategory(e.target.value)}
                    className="w-full py-3 pl-4 pr-10 text-sm font-medium text-white bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg appearance-none outline-none focus:border-[#1CD05D]"
                  >
                    <option>All Categories</option>
                    <option>Grains</option>
                    <option>Tubers</option>
                    <option>Legumes</option>
                    <option>Proteins</option>
                    <option>Vegetables</option>
                    <option>Produce</option>
                    <option>Oils</option>
                    <option>Spices</option>
                  </select>
                  <svg className="absolute w-4 h-4 text-gray-500 transform -translate-y-1/2 pointer-events-none right-4 top-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-2">OPERATION</label>
                <div className="relative">
                  <select 
                    value={bulkOperation}
                    onChange={(e) => setBulkOperation(e.target.value)}
                    className="w-full py-3 pl-4 pr-10 text-sm font-medium text-white bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg appearance-none outline-none focus:border-[#1CD05D]"
                  >
                    <option>Increase by (%)</option>
                    <option>Decrease by (%)</option>
                    <option>Set Flat Rate (₦)</option>
                  </select>
                  <svg className="absolute w-4 h-4 text-gray-500 transform -translate-y-1/2 pointer-events-none right-4 top-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-2">ENTER VALUE</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={bulkPercentage}
                    onChange={(e) => setBulkPercentage(e.target.value)}
                    className="w-full py-3 pl-4 pr-12 text-lg font-bold text-white bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg outline-none focus:border-[#1CD05D]"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">{bulkOperation.includes('%') ? '%' : '₦'}</span>
                </div>
              </div>

              <button 
                onClick={handleBulkUpdate}
                disabled={isBulkSaving || ingredients.length === 0}
                className="w-full py-3.5 mt-2 text-sm font-bold text-gray-900 transition-colors rounded-xl bg-[#1CD05D] hover:bg-[#15b04d] uppercase tracking-wider disabled:opacity-50"
              >
                {isBulkSaving ? 'UPDATING...' : 'APPLY PRICE CHANGE'}
              </button>
              
              <p className="text-[10px] text-center text-gray-500 mt-3">
                Action applies instantly to the database.
              </p>
            </div>

            <div className="mt-8 pt-8 border-t border-[#2A2A2A]">
              <h4 className="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-4">QUICK STATS</h4>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Most Volatile</span>
                  <span className="font-bold text-red-400">
                    {ingredients.find(i => i.status === 'Spiking')?.name || 'None'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Avg. Ingredient Price</span>
                  <span className="font-bold text-white">
                    ₦{ingredients.length > 0 ? Math.round(ingredients.reduce((a,b) => a + b.unitPrice, 0) / ingredients.length).toLocaleString() : 0}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ========================================= */}
      {/* SLIDE-OUT DRAWER (CREATE / EDIT)          */}
      {/* ========================================= */}
      
      {isDrawerOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" onClick={closeDrawer}></div>
      )}

      <div className={`fixed top-0 right-0 h-full w-full md:w-125 bg-[#111111] border-l border-[#2A2A2A] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Drawer Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-[#111111]/90 backdrop-blur border-b border-[#2A2A2A]">
          <h2 className="text-xl font-bold text-white">
            {drawerMode === 'create' ? 'Add New Ingredient' : 'Edit Ingredient'}
          </h2>
          <div className="flex items-center gap-3">
            {drawerMode === 'edit' && (
              <button onClick={handleDelete} className="p-2 text-red-500 hover:bg-red-950/30 rounded-lg transition-colors" title="Delete Ingredient">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            )}
            <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 text-sm font-bold text-gray-900 bg-[#1CD05D] rounded-lg hover:bg-[#15b04d] transition-colors disabled:opacity-50">
              {isSaving ? 'Saving...' : 'Save Data'}
            </button>
            <button onClick={closeDrawer} className="p-2 text-gray-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {/* Drawer Content */}
        <div className="p-6 space-y-6">
          
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Ingredient Name</label>
            <input 
              type="text" 
              value={formData.name || ''} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              className="w-full p-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#1CD05D] outline-none" 
              placeholder="e.g. Scent Leaves" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Category</label>
            <div className="relative">
              <select 
                value={formData.category || 'Grains'} 
                onChange={e => setFormData({...formData, category: e.target.value})} 
                className="w-full p-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-white appearance-none focus:border-[#1CD05D] outline-none"
              >
                <option value="Grains">Grains</option>
                <option value="Tubers">Tubers</option>
                <option value="Legumes">Legumes</option>
                <option value="Proteins">Proteins</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Produce">Produce</option>
                <option value="Oils">Oils</option>
                <option value="Spices">Spices / Aromatics</option>
              </select>
              <svg className="absolute w-4 h-4 text-gray-500 transform -translate-y-1/2 pointer-events-none right-4 top-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Unit Price (₦)</label>
              <input 
                type="number" 
                value={formData.unitPrice || ''} 
                onChange={e => setFormData({...formData, unitPrice: Number(e.target.value)})} 
                className="w-full p-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#1CD05D] outline-none" 
                placeholder="e.g. 1500" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Base Unit</label>
              <input 
                type="text" 
                value={formData.baseUnit || ''} 
                onChange={e => setFormData({...formData, baseUnit: e.target.value})} 
                className="w-full p-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#1CD05D] outline-none" 
                placeholder="e.g. 1kg, 1 Bunch, 1L" 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Market Status</label>
            <div className="relative">
              <select 
                value={formData.status || 'Stable'} 
                onChange={e => setFormData({...formData, status: e.target.value as any})} 
                className="w-full p-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-white appearance-none focus:border-[#1CD05D] outline-none"
              >
                <option value="Stable">Stable</option>
                <option value="Spiking">Spiking (Price Up)</option>
                <option value="Out of Season">Out of Season / Scarce</option>
              </select>
              <svg className="absolute w-4 h-4 text-gray-500 transform -translate-y-1/2 pointer-events-none right-4 top-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
          
          {drawerMode === 'edit' && (
            <div className="pt-4 border-t border-[#2A2A2A]">
              <p className="text-xs text-gray-500 mb-1">Database ID</p>
              <p className="text-xs font-mono text-gray-400 break-all">{selectedIngredient?.id}</p>
              <p className="text-[10px] text-gray-600 mt-2 leading-relaxed">
                Note: Changing the name or category of this item will automatically reflect in all recipes that currently use it.
              </p>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}