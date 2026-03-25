'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, limit, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Image from 'next/image';

// Types based on your schema
interface DashboardStats {
  totalUsers: number;
  avgBudget: number;
  activePlans: number;
}

interface MarketItem {
  id: string;
  name: string;
  unitPrice: number;
  baseUnit: string;
  status: 'Increasing' | 'Stable' | 'Fluctuating'; // Simulated status
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({ totalUsers: 0, avgBudget: 0, activePlans: 0 });
  const [marketItems, setMarketItems] = useState<MarketItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      setIsLoading(true);
      try {
        // 1. Fetch Users Data (Count & Avg Budget)
        const usersSnap = await getDocs(collection(db, 'users'));
        let totalBudget = 0;
        let userCount = 0;
        
        usersSnap.forEach((doc) => {
          userCount++;
          const data = doc.data();
          if (data.budgetGoal) totalBudget += data.budgetGoal;
        });

        // 2. Fetch Active Meal Plans
        const plansSnap = await getDocs(collection(db, 'mealPlans'));
        const activePlansCount = plansSnap.size; // In a real app, you'd query for active dates

        setStats({
          totalUsers: userCount,
          avgBudget: userCount > 0 ? Math.round(totalBudget / userCount) : 0,
          activePlans: activePlansCount
        });

        // 3. Fetch Market Ingredients for the Monitor
        const marketQuery = query(collection(db, 'market_ingredients'), limit(4));
        const marketSnap = await getDocs(marketQuery);
        
        const items: MarketItem[] = [];
        marketSnap.forEach((doc) => {
          const data = doc.data();
          items.push({
            id: doc.id,
            name: data.name || 'Unknown Item',
            unitPrice: data.unitPrice || 0,
            baseUnit: data.baseUnit || 'unit',
            // Simulating status since it's not in the base schema, but needed for UI
            status: Math.random() > 0.6 ? 'Increasing' : Math.random() > 0.5 ? 'Fluctuating' : 'Stable'
          });
        });
        
        setMarketItems(items);
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-gray-500 uppercase">
          <span>ADMIN</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="text-gray-300">DASHBOARD OVERVIEW</span>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white transition-colors rounded-lg bg-[#1CD05D] hover:bg-[#15b04d]">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          RUN SYSTEM REPORT
        </button>
      </header>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Total Users */}
        <div className="p-6 bg-[#111111] border border-[#2A2A2A] rounded-2xl">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-bold tracking-wider text-gray-500 uppercase">TOTAL USERS</h3>
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-4xl font-extrabold text-white">
              {isLoading ? '...' : stats.totalUsers.toLocaleString()}
            </p>
            <span className="px-2 py-1 text-xs font-bold text-[#1CD05D] bg-[#13251A] rounded-md">+8%</span>
          </div>
        </div>

        {/* Avg User Budget */}
        <div className="p-6 bg-[#111111] border border-[#2A2A2A] rounded-2xl">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-bold tracking-wider text-gray-500 uppercase">AVG. USER BUDGET</h3>
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-4xl font-extrabold text-white">
              <span className="text-gray-500 text-2xl mr-1">₦</span>
              {isLoading ? '...' : stats.avgBudget.toLocaleString()}
            </p>
            <span className="text-xs text-gray-500">Month over avg.</span>
          </div>
        </div>

        {/* Active Meal Plans */}
        <div className="p-6 bg-[#111111] border border-[#2A2A2A] rounded-2xl">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-bold tracking-wider text-gray-500 uppercase">ACTIVE MEAL PLANS</h3>
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-4xl font-extrabold text-white">
              {isLoading ? '...' : stats.activePlans.toLocaleString()}
            </p>
            <span className="px-2 py-1 text-xs font-bold text-[#1CD05D] border border-[#1CD05D]/30 bg-[#13251A] rounded-md">Live</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column (Chart + Market Table) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Chart Section */}
          <div className="p-6 bg-[#111111] border border-[#2A2A2A] rounded-2xl h-80 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-white">User Activity & Market Trends</h3>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#1CD05D]"></div>
                <span className="text-xs text-gray-400">User Growth</span>
              </div>
            </div>
            
            {/* CSS-based Chart Mockup to match design perfectly */}
            <div className="flex-1 relative w-full flex items-end">
               {/* Grid lines */}
               <div className="absolute inset-0 flex flex-col justify-between border-b border-gray-800">
                 <div className="border-b border-gray-800/50 h-full"></div>
                 <div className="border-b border-gray-800/50 h-full"></div>
                 <div className="border-b border-gray-800/50 h-full"></div>
               </div>
               
               {/* Simulated Chart Line */}
               <svg className="absolute inset-0 w-full h-full preserve-3d overflow-visible" viewBox="0 0 1000 200" preserveAspectRatio="none">
                  {/* Glow effect */}
                  <path d="M0,150 C200,140 400,120 600,100 C800,80 950,50 1000,20 L1000,200 L0,200 Z" fill="url(#gradient)" opacity="0.2" />
                  {/* Main Line */}
                  <path d="M0,150 C200,140 400,120 600,100 C800,80 950,50 1000,20" fill="none" stroke="#1CD05D" strokeWidth="6" strokeLinecap="round" className="drop-shadow-lg" />
                  
                  <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1CD05D" />
                      <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
               </svg>
            </div>
            
            {/* X-Axis Labels */}
            <div className="flex justify-between mt-4 text-[10px] font-bold tracking-widest text-gray-600 uppercase">
              <span>JAN</span><span>FEB</span><span>MAR</span><span>APR</span><span>MAY</span><span>JUN</span>
            </div>
          </div>

          {/* Market Price Monitor */}
          <div className="p-6 bg-[#111111] border border-[#2A2A2A] rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-bold tracking-wider text-gray-500 uppercase">MARKET PRICE MONITOR</h3>
              <button className="text-xs font-bold text-[#1CD05D] hover:underline">View Detailed Market</button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] font-bold tracking-wider text-gray-500 uppercase border-b border-[#2A2A2A]">
                  <tr>
                    <th className="pb-4 font-medium">ITEM NAME</th>
                    <th className="pb-4 font-medium">CURRENT PRICE (₦)</th>
                    <th className="pb-4 font-medium">STATUS</th>
                    <th className="pb-4 font-medium">LAST UPDATED</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2A2A2A]">
                  {marketItems.length === 0 && !isLoading && (
                     <tr><td colSpan={4} className="py-8 text-center text-gray-500">No market ingredients found in database.</td></tr>
                  )}
                  {marketItems.map((item, index) => (
                    <tr key={item.id} className="text-gray-300">
                      <td className="py-4 flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center shrink-0">
                           {/* Fallback geometric shape for image */}
                           <div className="w-3 h-3 bg-gray-600 rounded-sm"></div>
                        </div>
                        <span className="font-bold text-white">{item.name}</span>
                      </td>
                      <td className="py-4 font-bold text-white">₦{item.unitPrice.toLocaleString()} <span className="text-gray-500 font-normal">/{item.baseUnit}</span></td>
                      <td className="py-4">
                        {item.status === 'Increasing' && <span className="px-2 py-1 text-[10px] font-bold text-red-400 bg-red-950/30 border border-red-900/50 rounded-full">Increasing</span>}
                        {item.status === 'Stable' && <span className="px-2 py-1 text-[10px] font-bold text-[#1CD05D] bg-[#13251A] border border-[#1CD05D]/30 rounded-full">Stable</span>}
                        {item.status === 'Fluctuating' && <span className="px-2 py-1 text-[10px] font-bold text-yellow-500 bg-yellow-950/30 border border-yellow-900/50 rounded-full">Fluctuating</span>}
                      </td>
                      <td className="py-4 text-gray-500">2 mins ago</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="w-full py-3 mt-4 text-xs font-bold tracking-wider text-gray-400 uppercase transition-colors border border-dashed rounded-xl border-[#2A2A2A] hover:bg-[#1A1A1A] hover:text-white">
              View All Logs
            </button>
          </div>

        </div>

        {/* Right Column (Alerts) */}
        <div className="p-6 bg-[#111111] border border-[#2A2A2A] rounded-2xl flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <svg className="w-6 h-6 text-[#1CD05D]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            <h2 className="text-xl font-bold text-white">System Alerts &<br/>Feedback</h2>
          </div>

          <div className="space-y-4 flex-1">
            
            {/* Red Alert */}
            <div className="p-4 border rounded-xl bg-red-950/10 border-red-900/40">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 mt-0.5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <div>
                  <h4 className="font-bold text-red-100 mb-1">Price Variance Alert</h4>
                  <p className="text-sm text-red-300/80 leading-relaxed">Lagos rice market prices increased by +5% since morning.</p>
                </div>
              </div>
            </div>

            {/* Default Alert */}
            <div className="p-4 border rounded-xl bg-[#1A1A1A] border-[#2A2A2A]">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 mt-0.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                <div>
                  <h4 className="font-bold text-white mb-1">New User Feedback</h4>
                  <p className="text-sm text-gray-400 leading-relaxed mb-3">User request received for &quot;More Keto-friendly local recipes&quot;.</p>
                  <span className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">TICKET #4920</span>
                </div>
              </div>
            </div>

            {/* Green Alert */}
            <div className="p-4 border rounded-xl bg-[#13251A] border-[#1CD05D]/20">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 mt-0.5 text-[#1CD05D] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                <div>
                  <h4 className="font-bold text-[#1CD05D] mb-1">Database Sync Successful</h4>
                  <p className="text-sm text-green-300/80 leading-relaxed">540 items updated across all regional markets.</p>
                </div>
              </div>
            </div>

          </div>
          
          {/* Bottom Floating Alert */}
          <div className="mt-8 p-3 flex items-center justify-between border rounded-xl bg-[#111111] border-[#2A2A2A]">
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 bg-[#1CD05D] rounded-full animate-pulse"></div>
               <p className="text-xs text-gray-400"><span className="font-bold text-white">Market Price Update</span><br/>Garri prices decreased by 2.5% today.</p>
            </div>
            <button className="text-gray-500 hover:text-white"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
        </div>

      </div>
    </div>
  );
}