'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  
  // Dynamic Budget State
  const [budgetLimit, setBudgetLimit] = useState(0);
  const [spentAmount, setSpentAmount] = useState(0);
  const [activePlanCount, setActivePlanCount] = useState(0);
  const [isLoadingBudget, setIsLoadingBudget] = useState(true);

  // Fetch Budget Data on Mount
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) return;

      try {
        setIsLoadingBudget(true);
        
        // 1. Get the user's total budget and dynamic spent amount directly from profile
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          const uData = userDocSnap.data();
          const limit = Number(uData.budgetAmount) || 0;
          const period = uData.budgetPeriod || 'Monthly';
          
          // Normalize to Monthly for the widget view
          setBudgetLimit(period === 'Weekly' ? limit * 4 : limit);
          setSpentAmount(Number(uData.amountSpent) || 0);
        }

        // 2. Fetch Active Meal Plan Count (Consistent with Dashboard)
        const mealPlansQuery = query(collection(db, 'users', user.uid, 'meal_plans'));
        const mealPlansSnap = await getDocs(mealPlansQuery);
        setActivePlanCount(mealPlansSnap.size);

      } catch (error) {
        console.error("Error fetching sidebar budget data:", error);
      } finally {
        setIsLoadingBudget(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Dynamic Budget Calculations
  const safeBudget = budgetLimit > 0 ? budgetLimit : 1; 
  const budgetPercentage = Math.min((spentAmount / safeBudget) * 100, 100);
  const remaining = budgetLimit - spentAmount;
  const isOverBudget = spentAmount > budgetLimit;

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: <path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /> },
    { name: 'Meal Plan', href: '/dashboard/meal-plan', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /> },
    { name: 'Grocery List', href: '/dashboard/grocery', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /> },
    { name: 'Pantry Stock', href: '/dashboard/pantry', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /> },
  ];

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#111111] border-r border-gray-200 dark:border-[#2A2A2A] flex flex-col pt-6 pb-4 overflow-y-auto transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}> 
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-2 px-6 mb-10 text-[#1CD05D]">
        <div className="w-9 h-9 bg-[#1CD05D]/10 rounded-xl flex items-center justify-center">
           <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3L4 9v12h16V9l-8-6zm0 2.5L18.5 10v9.5h-13V10L12 5.5z"/></svg>
        </div>
        <span className="text-xl font-bold text-gray-900 dark:text-white">SmartMeal</span>
      </Link>

      {/* Main Navigation */}
      <nav className="px-4 space-y-1 mb-auto">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link key={link.name} href={link.href} className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${isActive ? 'bg-[#13251A] text-[#1CD05D]' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#1A1A1A] hover:text-gray-900 dark:hover:text-gray-200'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">{link.icon}</svg>
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Budget Widget (Synced with Dashboard) */}
      <div className="px-4 mt-8">
        <div className="p-5 border rounded-2xl bg-[#0A0A0A] border-[#2A2A2A] shadow-sm relative overflow-hidden group transition-all hover:border-[#1CD05D]/30">
          
          {isLoadingBudget ? (
            <div className="flex justify-center items-center h-24">
               <div className="w-5 h-5 border-2 border-[#1CD05D] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col">
                  <h4 className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">Budget Status</h4>
                  <p className="text-[9px] text-gray-600 font-bold uppercase mt-0.5">{activePlanCount} Plans Created</p>
                </div>
                {isOverBudget ? (
                  <span className="px-2 py-0.5 text-[9px] font-bold text-red-500 bg-red-950/30 border border-red-900/50 rounded uppercase tracking-wider">Over</span>
                ) : (
                  <span className="px-2 py-0.5 text-[9px] font-bold text-[#1CD05D] bg-[#13251A] border border-[#1CD05D]/20 rounded uppercase tracking-wider">On Track</span>
                )}
              </div>
              
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-xl font-bold text-white">₦{spentAmount.toLocaleString()}</span>
                <span className="text-[10px] text-gray-500">/ ₦{budgetLimit.toLocaleString()}</span>
              </div>
              
              <div className="w-full h-1.5 mb-4 bg-[#1A1A1A] rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${isOverBudget ? 'bg-red-500' : 'bg-[#1CD05D] shadow-[0_0_8px_rgba(28,208,93,0.4)]'}`} 
                  style={{ width: `${budgetPercentage}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t border-[#1A1A1A]">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Remaining</span>
                <span className={`text-xs font-bold ${remaining < 0 ? 'text-red-500' : 'text-white'}`}>
                  {remaining < 0 ? `-₦${Math.abs(remaining).toLocaleString()}` : `₦${remaining.toLocaleString()}`}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* User Actions (Optional) */}
      <div className="px-4 mt-4">
          <Link href="/dashboard/profile" className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-gray-500 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Account Settings
          </Link>
      </div>
    </aside>
  );
}