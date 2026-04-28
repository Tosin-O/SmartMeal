'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

// Data type for search results
interface SearchResult {
  id: string;
  title: string;
  type: 'Recipe' | 'Ingredient' | 'Cafeteria';
  url: string;
}

export default function DashboardHeader({ setSidebarOpen }: HeaderProps) {
  const router = useRouter();
  
  // States
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Refs for click-outside handling
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // 1. Fetch current user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) setUserEmail(user.email);
    });
    return () => unsubscribe();
  }, []);

  // 2. Click outside handlers
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 3. LIVE FIREBASE SEARCH EFFECT
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchQuery.trim().length > 1) {
        setIsSearching(true);
        setIsSearchOpen(true);
        
        try {
          const searchLower = searchQuery.toLowerCase();
          const results: SearchResult[] = [];

          // Fetch Recipes
          const recipesSnap = await getDocs(collection(db, 'recipes'));
          recipesSnap.forEach(doc => {
            const data = doc.data();
            if (data.title?.toLowerCase().includes(searchLower)) {
              results.push({ id: doc.id, title: data.title, type: 'Recipe', url: '/dashboard/meal-plan' });
            }
          });

          // Fetch Ingredients (Market Ingredients)
          const ingredientsSnap = await getDocs(collection(db, 'market_ingredients'));
          ingredientsSnap.forEach(doc => {
            const data = doc.data();
            if (data.name?.toLowerCase().includes(searchLower)) {
              results.push({ id: doc.id, title: data.name, type: 'Ingredient', url: '/dashboard/pantry' });
            }
          });

          // Fetch Cafeteria Meals
          const cafeteriaSnap = await getDocs(collection(db, 'cafeteria_meals'));
          cafeteriaSnap.forEach(doc => {
            const data = doc.data();
            if (data.name?.toLowerCase().includes(searchLower)) {
              results.push({ id: doc.id, title: data.name, type: 'Cafeteria', url: '/dashboard/meal-plan' });
            }
          });

          // Set results, limited to top 10 so the dropdown doesn't get too long
          setSearchResults(results.slice(0, 10));

        } catch (error) {
          console.error("Error performing search:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setIsSearchOpen(false);
      }
    };

    // DEBOUNCE: Wait 400ms after the user stops typing before querying Firebase
    const delayTimer = setTimeout(() => {
      fetchSearchResults();
    }, 400);

    return () => clearTimeout(delayTimer);
  }, [searchQuery]);

  // --- Handlers ---
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Keeps the dropdown open if they hit enter instead of clicking a result
    if (searchQuery.trim().length > 1) {
      setIsSearchOpen(true);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between p-6 bg-[#0A0A0A]/80 backdrop-blur-md border-b border-[#2A2A2A]">  
      {/* Left: Search & Mobile Menu Button */}
      <div className="flex items-center gap-4 flex-1 max-w-lg relative" ref={searchRef}>
        
        {/* Mobile Menu Toggle */}
        <button 
          onClick={() => setSidebarOpen(true)}
          className="p-2 -ml-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white lg:hidden"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>

        {/* Live Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <input 
            type="search" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.length > 1 && setIsSearchOpen(true)}
            placeholder="Search recipes, ingredients..." 
            className="w-full py-3 pl-12 pr-10 rounded-xl outline-none transition-colors border text-gray-900 bg-white border-gray-200 placeholder-gray-400 focus:border-[#1CD05D] focus:ring-1 focus:ring-[#1CD05D] dark:bg-[#1A1A1A] dark:border-[#2A2A2A] dark:text-white dark:placeholder-gray-500" 
          />
          
          {/* Clear Search Button (visible only when there's text) */}
          {searchQuery && (
            <button 
              type="button"
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </form>

        {/* --- SEARCH DROPDOWN RESULTS --- */}
        {isSearchOpen && (
          <div className="absolute top-full mt-2 left-0 w-full lg:ml-12 lg:w-[calc(100%-48px)] bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#2A2A2A] rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
            
            {isSearching ? (
              <div className="p-4 flex items-center justify-center text-gray-500 text-sm gap-2">
                <div className="w-4 h-4 border-2 border-[#1CD05D] border-t-transparent rounded-full animate-spin"></div>
                Searching...
              </div>
            ) : searchResults.length > 0 ? (
              <ul className="max-h-80 overflow-y-auto py-2">
                {searchResults.map((result) => (
                  <li key={result.id}>
                    <Link 
                      href={result.url}
                      onClick={() => setIsSearchOpen(false)}
                      className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#1A1A1A] transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-[#2A2A2A] flex items-center justify-center text-gray-500 group-hover:text-[#1CD05D] transition-colors">
                           {result.type === 'Recipe' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>}
                           {result.type === 'Ingredient' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>}
                           {result.type === 'Cafeteria' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{result.title}</p>
                          <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">{result.type}</p>
                        </div>
                      </div>
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-[#1CD05D] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-6 text-center">
                <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">No results found</p>
                <p className="text-xs text-gray-500">Try searching for a different recipe or ingredient.</p>
              </div>
            )}
            
          </div>
        )}
      </div>

      {/* Right: Notifications & Profile Dropdown */}
      <div className="flex items-center gap-4 relative" ref={profileRef}>
        
        {/* Notification Bell */}
        <button className="p-2 text-gray-400 transition-colors border border-gray-200 rounded-full hover:bg-gray-100 dark:border-[#2A2A2A] dark:hover:bg-[#1A1A1A]">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
        </button>
        
        {/* Avatar Button */}
        <button 
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="w-10 h-10 overflow-hidden bg-[#1A1A1A] rounded-full border-2 border-white dark:border-[#111111] hover:border-[#1CD05D] transition-colors focus:outline-none relative"
        >
          <Image 
            src="/user-avatar.jpg" 
            alt="User profile" 
            width={40} 
            height={40} 
            className="object-cover absolute inset-0 z-10"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <div className="w-full h-full flex items-center justify-center bg-[#1A1A1A] text-gray-400 absolute inset-0">
             <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
          </div>
        </button>

        {/* Profile Dropdown Menu */}
        {isProfileOpen && (
          <div className="absolute right-0 top-full mt-3 w-56 bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#2A2A2A] rounded-xl shadow-xl py-2 animate-in fade-in slide-in-from-top-2 z-50">
            
            <div className="px-4 py-3 border-b border-gray-100 dark:border-[#2A2A2A]">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Signed in as</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {userEmail || 'Loading...'}
              </p>
            </div>

            <div className="py-2 border-b border-gray-100 dark:border-[#2A2A2A]">
              <Link 
                href="/dashboard/profile" 
                onClick={() => setIsProfileOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1A1A1A] transition-colors"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                Edit Profile
              </Link>
            </div>

            <div className="py-2">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                Sign Out
              </button>
            </div>

          </div>
        )}
      </div>
    </header>
  );
}