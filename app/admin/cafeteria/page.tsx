'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, setDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Interface mapped exactly to your schema
interface CafeteriaMeal {
  id: string;
  name: string;
  price: number;
  cafeteriaName: string;
  isAvailable: boolean;
}

export default function CafeteriaManagement() {
  const [meals, setMeals] = useState<CafeteriaMeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCafe, setFilterCafe] = useState<string>('All'); // For the sidebar quick select

  // Drawer & Interaction State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
  const [selectedMeal, setSelectedMeal] = useState<CafeteriaMeal | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<CafeteriaMeal>>({});

  // Fetch from Firebase
  const fetchMeals = useCallback(async () => {
    setIsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'cafeteria_meals'));
      const fetchedMeals: CafeteriaMeal[] = [];
      
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        fetchedMeals.push({
          id: docSnap.id,
          name: data.name || 'Unnamed Meal',
          price: data.price || 0,
          cafeteriaName: data.cafeteriaName || 'Unknown Cafe',
          isAvailable: data.isAvailable ?? false,
        });
      });

      // Sort alphabetically by name
      fetchedMeals.sort((a, b) => a.name.localeCompare(b.name));
      setMeals(fetchedMeals);
    } catch (error) {
      console.error("Error fetching cafeteria meals:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);

  // --- Interaction Handlers ---

  const openCreateDrawer = () => {
    setFormData({
      name: '',
      price: 0,
      cafeteriaName: 'Crabberry',
      isAvailable: true,
    });
    setDrawerMode('create');
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (meal: CafeteriaMeal) => {
    setSelectedMeal(meal);
    setFormData(meal);
    setDrawerMode('edit');
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => { 
      setSelectedMeal(null); 
      setFormData({}); 
    }, 300);
  };

  const generateMealId = (name: string) => {
    if (!name) return `meal_${Date.now()}`;
    const formattedName = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    return `meal_${formattedName}`;
  };

  // --- CRUD Handlers ---

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (drawerMode === 'create') {
        const customId = generateMealId(formData.name || 'unknown');
        await setDoc(doc(db, 'cafeteria_meals', customId), {
          ...formData,
          mealId: customId,
          lastUpdated: new Date()
        });
      } else if (drawerMode === 'edit' && selectedMeal) {
        await updateDoc(doc(db, 'cafeteria_meals', selectedMeal.id), {
          ...formData,
          lastUpdated: new Date()
        });
      }
      await fetchMeals();
      closeDrawer();
    } catch (error) {
      console.error("Error saving meal:", error);
      alert("Failed to save meal. Check console for details.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMeal) return;
    if (confirm(`Are you sure you want to delete ${selectedMeal.name}?`)) {
      setIsSaving(true);
      try {
        await deleteDoc(doc(db, 'cafeteria_meals', selectedMeal.id));
        await fetchMeals();
        closeDrawer();
      } catch (error) {
        console.error("Error deleting meal:", error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Filter based on search and sidebar quick-select
  const filteredMeals = meals.filter(meal => {
    const matchesSearch = meal.name.toLowerCase().includes(searchQuery.toLowerCase()) || meal.cafeteriaName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCafe = filterCafe === 'All' || meal.cafeteriaName === filterCafe;
    return matchesSearch && matchesCafe;
  });

  // Dynamic stats
  const availableCount = meals.filter(m => m.isAvailable).length;
  const avgPrice = meals.length > 0 ? Math.round(meals.reduce((sum, m) => sum + m.price, 0) / meals.length) : 0;
  
  // Extract unique cafeterias for the sidebar filter
  const uniqueCafeterias = Array.from(new Set(meals.map(m => m.cafeteriaName)));

  return (
    <div className="p-6 md:p-8 max-w-400 mx-auto w-full animate-in fade-in duration-500 relative overflow-hidden">
      
      {/* 1. Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-gray-500 uppercase">
          <span>ADMIN</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="text-gray-300">CAFETERIA MENU MANAGEMENT</span>
        </div>
        
        <button onClick={openCreateDrawer} className="shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-gray-900 transition-colors rounded-lg bg-[#1CD05D] hover:bg-[#15b04d]">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
          NEW MEAL ITEM
        </button>
      </header>

      {/* 2. Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="p-6 bg-[#111111] border border-[#2A2A2A] rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-bold tracking-wider text-gray-500 uppercase">TOTAL MENU ITEMS</h3>
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-extrabold text-white">{isLoading ? '...' : meals.length}</p>
            <span className="px-2 py-1 text-xs font-bold text-[#1CD05D] bg-[#13251A] rounded-md">Across campus</span>
          </div>
        </div>

        <div className="p-6 bg-[#111111] border border-[#2A2A2A] rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-bold tracking-wider text-gray-500 uppercase">AVG. MEAL PRICE</h3>
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-extrabold text-white"><span className="text-gray-500 text-xl mr-1">₦</span>{isLoading ? '...' : avgPrice.toLocaleString()}</p>
            <span className="px-2 py-1 text-xs font-bold text-[#1CD05D] bg-[#13251A] rounded-md">Stable</span>
          </div>
        </div>

        <div className="p-6 bg-[#111111] border border-[#2A2A2A] rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-bold tracking-wider text-gray-500 uppercase">AVAILABLE TODAY</h3>
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-extrabold text-white">{isLoading ? '...' : availableCount}</p>
            <span className="px-2 py-1 text-xs font-bold text-gray-400 bg-[#1A1A1A] border border-[#2A2A2A] rounded-md">In Stock</span>
          </div>
        </div>
      </div>

      {/* 3. Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column (Meal Cards) */}
        <div className="xl:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold tracking-wider text-white uppercase">{filterCafe === 'All' ? 'ALL CAMPUS MEALS' : `${filterCafe} MENU`}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isLoading ? (
              <div className="col-span-full py-12 flex justify-center"><div className="w-8 h-8 border-4 border-[#1CD05D] border-t-transparent rounded-full animate-spin"></div></div>
            ) : filteredMeals.length === 0 ? (
              <div className="col-span-full py-12 text-center border border-dashed border-[#2A2A2A] rounded-2xl text-gray-500">
                No meals found. Click &quot;New Meal Item&quot; to add one.
              </div>
            ) : (
              filteredMeals.map((meal) => (
                <div 
                  key={meal.id} 
                  onClick={() => openEditDrawer(meal)}
                  className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6 flex flex-col hover:border-gray-500 transition-colors cursor-pointer group"
                >
                  
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-12 h-12 bg-[#1A1A1A] border border-[#2A2A2A] group-hover:border-gray-500 transition-colors rounded-xl flex items-center justify-center text-gray-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" /></svg>
                    </div>
                    
                    {meal.isAvailable ? (
                      <span className="px-3 py-1 text-[10px] font-bold text-gray-900 bg-[#1CD05D] rounded-full uppercase tracking-wider">AVAILABLE</span>
                    ) : (
                      <span className="px-3 py-1 text-[10px] font-bold text-red-400 bg-red-950/30 border border-red-900/50 rounded-full uppercase tracking-wider">SOLD OUT</span>
                    )}
                  </div>

                  <div className="mb-6 flex-1">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#1CD05D] transition-colors">{meal.name}</h3>
                    <p className="text-sm text-gray-400">Sold at: <span className="font-semibold text-gray-300">{meal.cafeteriaName}</span></p>
                  </div>

                  <div className="pt-4 border-t border-[#2A2A2A]">
                    <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-1">PRICE</p>
                    <p className="text-lg font-bold text-white">₦{meal.price.toLocaleString()}</p>
                  </div>

                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column (Sidebar Controls) */}
        <div>
          <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6">
            
            <div className="flex items-center gap-2 mb-6">
              <svg className="w-5 h-5 text-[#1CD05D]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
              <h2 className="text-lg font-bold text-white">Menu Filters</h2>
            </div>
            
            <p className="text-sm text-gray-400 mb-6">
              Quickly locate and update meal availability across different cafeterias.
            </p>

            {/* Search */}
            <div className="relative mb-8">
              <input 
                type="text" 
                placeholder="Search meals..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-3 pl-10 pr-4 text-sm rounded-lg outline-none transition-colors border text-white bg-[#1A1A1A] border-[#2A2A2A] placeholder-gray-500 focus:border-[#1CD05D]" 
              />
              <svg className="absolute w-4 h-4 text-gray-500 transform -translate-y-1/2 left-4 top-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>

            {/* Quick Select by Cafe */}
            <div className="mb-8">
              <h4 className="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-3">FILTER BY CAFETERIA</h4>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setFilterCafe('All')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border ${filterCafe === 'All' ? 'bg-[#13251A] border-[#1CD05D] text-[#1CD05D]' : 'bg-[#1A1A1A] border-[#2A2A2A] text-gray-300 hover:border-[#1CD05D]'}`}
                >
                  All Locations
                </button>
                {uniqueCafeterias.map(cafe => (
                  <button 
                    key={cafe}
                    onClick={() => setFilterCafe(cafe)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border ${filterCafe === cafe ? 'bg-[#13251A] border-[#1CD05D] text-[#1CD05D]' : 'bg-[#1A1A1A] border-[#2A2A2A] text-gray-300 hover:border-[#1CD05D]'}`}
                  >
                    {cafe}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* System Alert Floating Box */}
          <div className="mt-6 p-4 flex items-start gap-3 border rounded-xl bg-yellow-950/10 border-yellow-900/30">
            <div className="w-2 h-2 mt-1.5 bg-yellow-500 rounded-full shrink-0 animate-pulse"></div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h4 className="text-xs font-bold text-white">Stock Alert</h4>
                <button className="text-gray-500 hover:text-white"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">Ensure Sold Out items are toggled off so they don&apos;t appear in user meal plans.</p>
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
            {drawerMode === 'create' ? 'Add New Meal' : 'Edit Meal'}
          </h2>
          <div className="flex items-center gap-3">
            {drawerMode === 'edit' && (
              <button onClick={handleDelete} className="p-2 text-red-500 hover:bg-red-950/30 rounded-lg transition-colors" title="Delete Meal">
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
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Meal Name</label>
            <input 
              type="text" 
              value={formData.name || ''} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              className="w-full p-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#1CD05D] outline-none" 
              placeholder="e.g. Jollof Rice & Turkey" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Selling Price (₦)</label>
              <input 
                type="number" 
                value={formData.price || ''} 
                onChange={e => setFormData({...formData, price: Number(e.target.value)})} 
                className="w-full p-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#1CD05D] outline-none" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Cafeteria</label>
              <input 
                type="text" 
                value={formData.cafeteriaName || ''} 
                onChange={e => setFormData({...formData, cafeteriaName: e.target.value})} 
                className="w-full p-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#1CD05D] outline-none" 
                placeholder="e.g. Crabberry, Bukka" 
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#2A2A2A]">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white mb-1">Availability Status</h4>
                <p className="text-xs text-gray-500">Toggle off if the meal is currently sold out.</p>
              </div>
              <div 
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${formData.isAvailable ? 'bg-[#1CD05D]' : 'bg-[#2A2A2A]'}`}
                onClick={() => setFormData({...formData, isAvailable: !formData.isAvailable})}
              >
                <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${formData.isAvailable ? 'left-7' : 'left-1'}`}></div>
              </div>
            </div>
          </div>
          
          {drawerMode === 'edit' && (
            <div className="pt-4 border-t border-[#2A2A2A]">
              <p className="text-xs text-gray-500 mb-1">Database ID</p>
              <p className="text-xs font-mono text-gray-400 break-all">{selectedMeal?.id}</p>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}