'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';

// TypeScript Interfaces
interface RecipeIngredient {
  ingredientId: string;
  amount: number;
  unit: string;
}

interface Recipe {
  id: string;
  title: string;
  description: string;
  category: string;
  instructions: string[];
  ingredientsNeeded: RecipeIngredient[];
  prepTime?: string;
  estimatedCost?: number;
  tags?: string[];
  status?: 'LIVE' | 'DRAFT';
  image?: string;
}

interface MarketIngredient {
  id: string;
  name: string;
  baseUnit: string;
}

export default function RecipeManagement() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [marketIngredients, setMarketIngredients] = useState<MarketIngredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Drawer & Interaction State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'view' | 'edit' | 'create'>('view');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State for Create/Edit
  const [formData, setFormData] = useState<Partial<Recipe>>({});

  // Stats State
  const [stats, setStats] = useState({ totalRecipes: 0, avgCost: 0, draftCount: 0 });

  // Fetch Data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Recipes
      const recipesSnap = await getDocs(collection(db, 'recipes'));
      const fetchedRecipes: Recipe[] = [];
      let totalCost = 0;
      let drafts = 0;
      
      recipesSnap.forEach((doc) => {
        const data = doc.data();
        const recipeCost = data.estimatedCost || 0;
        totalCost += recipeCost;
        if (data.status === 'DRAFT') drafts++;
        
        fetchedRecipes.push({
          id: doc.id,
          title: data.title || 'Untitled Recipe',
          description: data.description || '',
          category: data.category || 'Uncategorized',
          instructions: data.instructions || [],
          ingredientsNeeded: data.ingredientsNeeded || [],
          prepTime: data.prepTime || '45 mins',
          estimatedCost: recipeCost,
          tags: data.tags || [],
          status: data.status || 'DRAFT',
          image: data.image || '/jollof.jpg', 
        });
      });

      setRecipes(fetchedRecipes);
      setStats({
        totalRecipes: fetchedRecipes.length,
        avgCost: fetchedRecipes.length > 0 ? Math.round(totalCost / fetchedRecipes.length) : 0,
        draftCount: drafts
      });

      // 2. Fetch Market Ingredients (for the dropdowns and resolving names)
      const ingredientsSnap = await getDocs(collection(db, 'market_ingredients'));
      const fetchedIngredients: MarketIngredient[] = [];
      ingredientsSnap.forEach(doc => {
        fetchedIngredients.push({ id: doc.id, name: doc.data().name, baseUnit: doc.data().baseUnit });
      });
      setMarketIngredients(fetchedIngredients);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Interaction Handlers ---

  const openCreateDrawer = () => {
    setFormData({
      title: '', description: '', category: 'Lunch', prepTime: '', estimatedCost: 0, 
      tags: [], status: 'DRAFT', image: '', instructions: [''], ingredientsNeeded: []
    });
    setDrawerMode('create');
    setIsDrawerOpen(true);
  };

  const openViewDrawer = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setFormData(recipe);
    setDrawerMode('view');
    setIsDrawerOpen(true);
  };

  const openEditDrawer = () => {
    setDrawerMode('edit');
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => { setSelectedRecipe(null); setFormData({}); }, 300); // Wait for slide animation
  };

  // --- Form Handlers ---

  const handleArrayChange = (index: number, field: 'instructions', value: string) => {
    const newArray = [...(formData[field] || [])];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayItem = (field: 'instructions') => {
    setFormData({ ...formData, [field]: [...(formData[field] || []), ''] });
  };

  const removeArrayItem = (index: number, field: 'instructions') => {
    const newArray = [...(formData[field] || [])];
    newArray.splice(index, 1);
    setFormData({ ...formData, [field]: newArray });
  };

  const handleIngredientChange = (index: number, key: keyof RecipeIngredient, value: string | number) => {
    const newIngredients = [...(formData.ingredientsNeeded || [])];
    newIngredients[index] = { ...newIngredients[index], [key]: value };
    setFormData({ ...formData, ingredientsNeeded: newIngredients });
  };

  const addIngredientItem = () => {
    setFormData({ 
      ...formData, 
      ingredientsNeeded: [...(formData.ingredientsNeeded || []), { ingredientId: '', amount: 1, unit: 'kg' }] 
    });
  };

  const removeIngredientItem = (index: number) => {
    const newIngredients = [...(formData.ingredientsNeeded || [])];
    newIngredients.splice(index, 1);
    setFormData({ ...formData, ingredientsNeeded: newIngredients });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (drawerMode === 'create') {
        await addDoc(collection(db, 'recipes'), formData);
      } else if (drawerMode === 'edit' && selectedRecipe) {
        await updateDoc(doc(db, 'recipes', selectedRecipe.id), formData);
      }
      await fetchData(); // Refresh data
      closeDrawer();
    } catch (error) {
      console.error("Error saving recipe:", error);
      alert("Failed to save recipe. Please check console.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRecipe) return;
    if (confirm("Are you sure you want to delete this recipe? This cannot be undone.")) {
      setIsSaving(true);
      try {
        await deleteDoc(doc(db, 'recipes', selectedRecipe.id));
        await fetchData();
        closeDrawer();
      } catch (error) {
        console.error("Error deleting recipe:", error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  // --- Helper to get ingredient name by ID ---
  const getIngredientName = (id: string) => {
    const ing = marketIngredients.find(i => i.id === id);
    // Updated to show the missing ID so you know what to add to your database!
    return ing ? ing.name : `Missing (${id})`;
  };

  // --- Computed Data for UI ---
  const filteredRecipes = recipes.filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const draftRecipesList = recipes.filter(r => r.status === 'DRAFT');
  
  const categoryCounts = recipes.reduce((acc, recipe) => {
    const cat = recipe.category || 'Uncategorized';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6 md:p-8 max-w-400 mx-auto w-full animate-in fade-in duration-500 relative overflow-hidden">
      
      {/* 1. Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-gray-500 uppercase">
          <span>ADMIN</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="text-gray-300">RECIPE MANAGEMENT</span>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input 
              type="search" 
              placeholder="Search recipes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2 pl-10 pr-4 text-sm rounded-lg outline-none transition-colors border text-white bg-[#111111] border-[#2A2A2A] placeholder-gray-500 focus:border-[#1CD05D]" 
            />
          </div>
          <button onClick={openCreateDrawer} className="shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-900 transition-colors rounded-lg bg-[#1CD05D] hover:bg-[#15b04d]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
            New Recipe
          </button>
        </div>
      </header>

      {/* 2. Top Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="p-6 bg-[#111111] border border-[#2A2A2A] rounded-2xl flex flex-col justify-between">
          <h3 className="text-xs font-bold tracking-wider text-gray-500 uppercase mb-4">TOTAL RECIPES</h3>
          <p className="text-3xl font-extrabold text-white">{isLoading ? '...' : stats.totalRecipes}</p>
        </div>
        <div className="p-6 bg-[#111111] border border-[#2A2A2A] rounded-2xl flex flex-col justify-between">
          <h3 className="text-xs font-bold tracking-wider text-gray-500 uppercase mb-4">AVG. COST TO COOK</h3>
          <p className="text-3xl font-extrabold text-white"><span className="text-gray-500 text-xl mr-1">₦</span>{isLoading ? '...' : stats.avgCost.toLocaleString()}</p>
        </div>
        <div className="p-6 bg-[#111111] border border-[#2A2A2A] rounded-2xl flex flex-col justify-between">
          <h3 className="text-xs font-bold tracking-wider text-gray-500 uppercase mb-4">DRAFT RECIPES</h3>
          <p className="text-3xl font-extrabold text-white">{stats.draftCount}</p>
        </div>
        <div className="p-6 bg-[#0A0A0A] border border-dashed border-[#2A2A2A] hover:border-[#1CD05D]/50 transition-colors rounded-2xl flex flex-col items-center justify-center cursor-pointer group">
          <svg className="w-6 h-6 text-[#1CD05D] mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          <span className="text-sm font-bold text-[#1CD05D] uppercase tracking-wider">GENERATE REPORT</span>
        </div>
      </div>

      {/* 3. Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column (Recipe Library) */}
        <div className="xl:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-[#1CD05D]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              Recipe Library
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isLoading ? (
               <div className="col-span-full py-12 flex justify-center"><div className="w-8 h-8 border-4 border-[#1CD05D] border-t-transparent rounded-full animate-spin"></div></div>
            ) : filteredRecipes.length === 0 ? (
              <div className="col-span-full py-12 text-center border border-dashed border-[#2A2A2A] rounded-2xl text-gray-500">
                No recipes found. Click &quot;New Recipe&quot; to add your first dish.
              </div>
            ) : (
              filteredRecipes.map((recipe) => (
                <div 
                  key={recipe.id} 
                  onClick={() => openViewDrawer(recipe)}
                  className="bg-[#111111] border border-[#2A2A2A] rounded-2xl overflow-hidden group cursor-pointer hover:border-gray-500 transition-colors flex flex-col"
                >
                  <div className="relative h-48 w-full bg-[#1A1A1A] shrink-0">
                    <Image src={recipe.image || '/jollof.jpg'} alt={recipe.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-linear-to-t from-[#111111] via-transparent to-transparent opacity-80"></div>
                    <div className="absolute top-4 right-4 flex gap-2">
                      {recipe.status === 'LIVE' ? (
                        <span className="px-3 py-1 text-[10px] font-bold text-gray-900 bg-[#1CD05D] rounded-full uppercase shadow-lg shadow-black/50">LIVE: ₦{recipe.estimatedCost?.toLocaleString()}</span>
                      ) : (
                        <span className="px-3 py-1 text-[10px] font-bold text-white bg-gray-600 rounded-full uppercase shadow-lg shadow-black/50">DRAFT</span>
                      )}
                    </div>
                    <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-xs font-semibold text-white bg-black/50 backdrop-blur-sm px-2 py-1 rounded-md">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {recipe.prepTime}
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-1 truncate">{recipe.title}</h3>
                    <div className="flex gap-2 text-[10px] font-bold tracking-wider text-gray-500 uppercase mb-6 overflow-hidden">
                      {recipe.tags?.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="whitespace-nowrap">{tag}{idx < (recipe.tags?.length || 0) - 1 ? ' • ' : ''}</span>
                      ))}
                    </div>
                    <div className="mt-auto pt-4 border-t border-[#2A2A2A] text-sm text-gray-400 font-medium">
                      {recipe.ingredientsNeeded.length} Ingredients Required
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column (Insights & Drafts) */}
        <div className="hidden xl:block space-y-6">
          
          {/* Category Breakdown */}
          <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6 border-b border-[#2A2A2A] pb-4">
              <svg className="w-5 h-5 text-[#1CD05D]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
              <h2 className="text-sm font-bold tracking-wider text-gray-500 uppercase">CATEGORY BREAKDOWN</h2>
            </div>
            <div className="space-y-5">
              {Object.entries(categoryCounts).map(([cat, count]) => {
                const percentage = stats.totalRecipes > 0 ? Math.round((count / stats.totalRecipes) * 100) : 0;
                return (
                  <div key={cat}>
                    <div className="flex justify-between items-center mb-1 text-sm">
                      <span className="font-bold text-white">{cat}</span>
                      <span className="text-gray-400">{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#2A2A2A] rounded-full overflow-hidden">
                      <div className="h-full bg-[#1CD05D] rounded-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
              {Object.keys(categoryCounts).length === 0 && <p className="text-sm text-gray-500">No categories found.</p>}
            </div>
          </div>

          {/* Needs Review / Drafts */}
          <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6 border-b border-[#2A2A2A] pb-4">
              <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <h2 className="text-sm font-bold tracking-wider text-gray-500 uppercase">NEEDS REVIEW (DRAFTS)</h2>
            </div>
            
            <div className="space-y-3">
              {draftRecipesList.length === 0 && <p className="text-sm text-gray-500">All recipes are live!</p>}
              
              {draftRecipesList.map(draft => (
                <div key={draft.id} onClick={() => openViewDrawer(draft)} className="p-3 bg-[#1A1A1A] border border-[#2A2A2A] hover:border-gray-500 rounded-xl cursor-pointer transition-colors flex justify-between items-center">
                  <div className="overflow-hidden pr-2">
                    <p className="text-sm font-bold text-white truncate">{draft.title}</p>
                    <p className="text-xs text-gray-500 truncate">Missing {draft.ingredientsNeeded.length === 0 ? 'Ingredients' : 'Approval'}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* ========================================= */}
      {/* SLIDE-OUT DRAWER (CREATE / EDIT / VIEW)   */}
      {/* ========================================= */}
      
      {/* Backdrop */}
      {isDrawerOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" onClick={closeDrawer}></div>
      )}

      {/* Drawer Panel */}
      <div className={`fixed top-0 right-0 h-full w-full md:w-150 bg-[#111111] border-l border-[#2A2A2A] shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Drawer Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-[#111111]/90 backdrop-blur border-b border-[#2A2A2A]">
          <h2 className="text-xl font-bold text-white">
            {drawerMode === 'create' ? 'Create New Recipe' : drawerMode === 'edit' ? 'Edit Recipe' : 'Recipe Details'}
          </h2>
          <div className="flex items-center gap-3">
            {drawerMode === 'view' && (
              <>
                <button onClick={handleDelete} className="p-2 text-red-500 hover:bg-red-950/30 rounded-lg transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                <button onClick={openEditDrawer} className="px-4 py-2 text-sm font-bold text-gray-900 bg-white rounded-lg hover:bg-gray-200 transition-colors">Edit</button>
              </>
            )}
            {(drawerMode === 'create' || drawerMode === 'edit') && (
              <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 text-sm font-bold text-gray-900 bg-[#1CD05D] rounded-lg hover:bg-[#15b04d] transition-colors disabled:opacity-50">
                {isSaving ? 'Saving...' : 'Save Recipe'}
              </button>
            )}
            <button onClick={closeDrawer} className="p-2 text-gray-400 hover:text-white"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
        </div>

        {/* Drawer Content Form */}
        <div className="p-6 space-y-8">
          
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold tracking-widest text-[#1CD05D] uppercase border-b border-[#2A2A2A] pb-2">Basic Information</h3>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Recipe Title</label>
              {drawerMode === 'view' ? <p className="text-white text-lg font-bold">{formData.title}</p> : (
                <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#1CD05D] outline-none" placeholder="e.g. Party Jollof Rice" />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Description</label>
              {drawerMode === 'view' ? <p className="text-gray-300">{formData.description}</p> : (
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#1CD05D] outline-none min-h-25" placeholder="Brief overview of the dish..." />
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Category</label>
                {drawerMode === 'view' ? <p className="text-white">{formData.category}</p> : (
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#1CD05D] outline-none">
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                    <option value="Snack">Snack</option>
                  </select>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Status</label>
                {drawerMode === 'view' ? <p className="text-white">{formData.status}</p> : (
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as 'LIVE' | 'DRAFT'})} className="w-full p-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#1CD05D] outline-none">
                    <option value="LIVE">LIVE (Public)</option>
                    <option value="DRAFT">DRAFT (Hidden)</option>
                  </select>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Prep Time</label>
                {drawerMode === 'view' ? <p className="text-white">{formData.prepTime}</p> : (
                  <input type="text" value={formData.prepTime} onChange={e => setFormData({...formData, prepTime: e.target.value})} className="w-full p-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#1CD05D] outline-none" placeholder="e.g. 45 mins" />
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Estimated Cost (₦)</label>
                {drawerMode === 'view' ? <p className="text-white">₦{formData.estimatedCost?.toLocaleString()}</p> : (
                  <input type="number" value={formData.estimatedCost} onChange={e => setFormData({...formData, estimatedCost: Number(e.target.value)})} className="w-full p-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#1CD05D] outline-none" placeholder="0" />
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tags (Comma Separated)</label>
              {drawerMode === 'view' ? (
                <div className="flex gap-2 flex-wrap">
                  {formData.tags?.map((t, i) => <span key={i} className="px-2 py-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded text-xs font-semibold tracking-wider text-gray-300">{t}</span>)}
                </div>
              ) : (
                <input type="text" value={formData.tags?.join(', ')} onChange={e => setFormData({...formData, tags: e.target.value.split(',').map(t => t.trim())})} className="w-full p-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#1CD05D] outline-none" placeholder="e.g. VEGAN, SPICY, KETO" />
              )}
            </div>
            
            {drawerMode !== 'view' && (
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Image URL</label>
                <input type="text" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full p-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#1CD05D] outline-none" placeholder="/image.jpg or https://..." />
                <p className="text-[10px] text-gray-500 mt-1">Ensure image exists in public folder or provide a full URL.</p>
              </div>
            )}
          </div>

          {/* Ingredients Needed */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold tracking-widest text-[#1CD05D] uppercase border-b border-[#2A2A2A] pb-2 flex justify-between items-center">
              Ingredients Needed
              {drawerMode !== 'view' && <button onClick={addIngredientItem} className="text-white hover:text-[#1CD05D]">+ Add</button>}
            </h3>
            
            {formData.ingredientsNeeded?.length === 0 && <p className="text-sm text-gray-500">No ingredients added yet.</p>}
            
            {formData.ingredientsNeeded?.map((ing, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-[#1A1A1A] p-3 rounded-lg border border-[#2A2A2A]">
                {drawerMode === 'view' ? (
                  <p className="text-sm text-white flex-1">{ing.amount} {ing.unit} of <span className="font-bold text-[#1CD05D]">{getIngredientName(ing.ingredientId)}</span></p>
                ) : (
                  <>
                    <select value={ing.ingredientId} onChange={e => handleIngredientChange(idx, 'ingredientId', e.target.value)} className="flex-1 p-2 bg-black border border-[#2A2A2A] rounded text-white text-sm outline-none">
                      <option value="">Select Ingredient...</option>
                      {marketIngredients.map(mi => <option key={mi.id} value={mi.id}>{mi.name}</option>)}
                    </select>
                    <input type="number" value={ing.amount} onChange={e => handleIngredientChange(idx, 'amount', Number(e.target.value))} className="w-20 p-2 bg-black border border-[#2A2A2A] rounded text-white text-sm outline-none" placeholder="Qty" />
                    <input type="text" value={ing.unit} onChange={e => handleIngredientChange(idx, 'unit', e.target.value)} className="w-20 p-2 bg-black border border-[#2A2A2A] rounded text-white text-sm outline-none" placeholder="Unit" />
                    <button onClick={() => removeIngredientItem(idx)} className="p-2 text-red-500 hover:bg-red-950/30 rounded"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Instructions */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold tracking-widest text-[#1CD05D] uppercase border-b border-[#2A2A2A] pb-2 flex justify-between items-center">
              Cooking Instructions
              {drawerMode !== 'view' && <button onClick={() => addArrayItem('instructions')} className="text-white hover:text-[#1CD05D]">+ Add Step</button>}
            </h3>
            
            {formData.instructions?.map((step, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-[#2A2A2A] flex items-center justify-center shrink-0 text-xs font-bold text-gray-400 mt-1">{idx + 1}</div>
                {drawerMode === 'view' ? (
                  <p className="text-gray-300 text-sm pt-1">{step}</p>
                ) : (
                  <div className="flex-1 flex gap-2">
                    <textarea value={step} onChange={e => handleArrayChange(idx, 'instructions', e.target.value)} className="flex-1 p-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#1CD05D] outline-none min-h-15" placeholder={`Step ${idx + 1}...`} />
                    <button onClick={() => removeArrayItem(idx, 'instructions')} className="p-2 text-red-500 hover:bg-red-950/30 rounded self-start"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </div>

    </div>
  );
}