import Image from 'next/image';

export default function DashboardPage() {
  return (
    <div className="space-y-10">
      
      
      {/* 1. Page Header - SIMPLIFIED, Shared elements moved to shared header */}
      <header className="pb-6 border-b border-gray-200 dark:border-[#2A2A2A]">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Financial Overview</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Targeting <span className="font-bold text-[#1CD05D]">25% savings</span> based on your current pantry stock.
          {/* Note: Market Data text moved to shared header */}
        </p>
      </header>

      {/* 2. Live Market Insights */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold tracking-wider text-gray-400 uppercase">Live Market Insights</h2>
          <div className="flex gap-2">
            <button className="p-1 text-gray-400 border border-gray-200 rounded dark:border-[#2A2A2A] hover:bg-gray-50 dark:hover:bg-[#1A1A1A]"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
            <button className="p-1 text-gray-400 border border-gray-200 rounded dark:border-[#2A2A2A] hover:bg-gray-50 dark:hover:bg-[#1A1A1A]"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl dark:bg-[#111111] dark:border-[#2A2A2A] shadow-sm">
            <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden relative shrink-0">
               <Image src="/yam.jpg" alt="Yams" fill className="object-cover" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#1CD05D] uppercase tracking-wider mb-0.5">Best Value</p>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">Yam Prices Dropped 10%</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Availability high in Mainland markets</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl dark:bg-[#111111] dark:border-[#2A2A2A] shadow-sm">
            <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden relative shrink-0">
               <Image src="/tomato.jpg" alt="Tomatoes" fill className="object-cover" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-0.5">Volatility Alert</p>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">Tomato Shortage Expected</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Stock up on canned paste now</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl dark:bg-[#111111] dark:border-[#2A2A2A] shadow-sm">
            <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden relative shrink-0">
               <Image src="/rice.jpg" alt="Rice bag" fill className="object-cover" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-0.5">Bulk Opportunity</p>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">Rice Stability Holding</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Buy bulk 25kg+ for max savings</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Main Grid (Recommendations + Pantry) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Optimized Recommendations</h2>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500 dark:text-gray-400">Sort by:</span>
              <button className="flex items-center gap-2 px-3 py-1.5 font-semibold text-gray-900 bg-white border border-gray-200 rounded-lg dark:bg-[#1A1A1A] dark:border-[#2A2A2A] dark:text-white">
                Highest Savings
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Meal Card 1 */}
            <div className="bg-white border border-gray-200 rounded-2xl dark:bg-[#111111] dark:border-[#2A2A2A] shadow-sm overflow-hidden flex flex-col">
              <div className="relative h-48 w-full bg-gray-200">
                <Image src="/jollof.jpg" alt="Jollof Rice" fill className="object-cover" />
                <div className="absolute top-4 left-4 space-y-2">
                  <span className="block px-3 py-1 text-xs font-bold text-white bg-[#1CD05D] rounded-full">-₦1,250 STOCK CREDIT</span>
                  <span className="block px-3 py-1 text-xs font-bold text-gray-900 bg-white/90 backdrop-blur rounded-full w-max">SEASONAL VALUE</span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Low-Cost Party Jollof</h3>
                    <p className="text-xs text-gray-500 mt-1">Prep: 45 min • Yield: 4 Bowls</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">TO BUY</p>
                    <p className="text-xl font-extrabold text-[#1CD05D]">₦3,200</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-auto mb-6 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-[#2A2A2A] pt-4">
                  <span>Protein Efficiency</span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-[#1CD05D]"></div>
                    <div className="w-2 h-2 rounded-full bg-[#1CD05D]"></div>
                    <div className="w-2 h-2 rounded-full bg-[#1CD05D]"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                </div>
                <button className="w-full py-3 text-sm font-bold text-white transition-colors rounded-xl bg-[#1CD05D] hover:bg-[#15b04d] flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  BUILD GROCERY LIST
                </button>
              </div>
            </div>

            {/* Meal Card 2 */}
            <div className="bg-white border border-gray-200 rounded-2xl dark:bg-[#111111] dark:border-[#2A2A2A] shadow-sm overflow-hidden flex flex-col">
              <div className="relative h-48 w-full bg-gray-200">
                <Image src="/okra.jpg" alt="Okra Soup" fill className="object-cover" />
                <div className="absolute top-4 left-4 space-y-2">
                  <span className="block px-3 py-1 text-xs font-bold text-white bg-blue-600 rounded-full">EXTREME VALUE PLAN</span>
                  <span className="block px-3 py-1 text-xs font-bold text-gray-900 bg-white/90 backdrop-blur rounded-full w-max">LOW COST</span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Fisherman&apos;s Okra</h3>
                    <p className="text-xs text-gray-500 mt-1">Prep: 25 min • Yield: 3 Bowls</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">TO BUY</p>
                    <p className="text-xl font-extrabold text-[#1CD05D]">₦1,850</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-auto mb-6 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-[#2A2A2A] pt-4">
                  <span>Waste Reduction</span>
                  <span className="font-bold text-[#1CD05D]">100% Score</span>
                </div>
                <button className="w-full py-3 text-sm font-bold text-white transition-colors rounded-xl bg-[#1CD05D] hover:bg-[#15b04d] flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  BUILD GROCERY LIST
                </button>
              </div>
            </div>
          </div>
        </div>

       {/* Right Col: Pantry Check */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pantry Check</h2>
            <button className="text-xs font-bold text-[#1CD05D] uppercase tracking-wider hover:underline">UPDATE STOCK</button>
          </div>

          <div className="p-6 bg-white border border-gray-200 rounded-2xl dark:bg-[#111111] dark:border-[#2A2A2A] shadow-sm">
            <p className="mb-6 text-xs font-bold tracking-wider text-gray-400 uppercase">USAGE IN RECOMMENDATIONS</p>
            
            <div className="space-y-6">
              {/* Item 1 */}
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-lg bg-green-50 dark:bg-[#13251A] flex items-center justify-center shrink-0 text-[#1CD05D]">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <div className="flex-1 pt-0.5">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-base font-bold text-gray-900 dark:text-white">Long-grain Rice</h4>
                    <span className="text-xs font-semibold text-gray-500">2.5kg Left</span>
                  </div>
                  <span className="inline-block px-2 py-1 text-[10px] bg-gray-100 dark:bg-[#1A1A1A] text-gray-600 dark:text-gray-400 rounded mb-4 font-medium">Required for Jollof</span>
                  
                  {/* PERFECTLY THIN PROGRESS BAR */}
                  <div className="w-full h-0.5 bg-gray-200 dark:bg-[#2A2A2A]">
                    <div className="h-full bg-[#1CD05D]" style={{ width: '80%' }}></div>
                  </div>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-lg bg-green-50 dark:bg-[#13251A] flex items-center justify-center shrink-0 text-[#1CD05D]">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                </div>
                <div className="flex-1 pt-0.5">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-base font-bold text-gray-900 dark:text-white">Vegetable Oil</h4>
                    <span className="text-xs font-semibold text-gray-500">1.2L Left</span>
                  </div>
                  <span className="inline-block px-2 py-1 text-[10px] bg-gray-100 dark:bg-[#1A1A1A] text-gray-600 dark:text-gray-400 rounded mb-4 font-medium">Required for All Meals</span>
                  
                  <div className="w-full h-0.5 bg-gray-200 dark:bg-[#2A2A2A]">
                    <div className="h-full bg-[#1CD05D]" style={{ width: '60%' }}></div>
                  </div>
                </div>
              </div>

              {/* Item 3 */}
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-lg bg-orange-50 dark:bg-[#2A1B13] flex items-center justify-center shrink-0 text-[#F97316]">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <div className="flex-1 pt-0.5">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-base font-bold text-gray-900 dark:text-white">Seasoning Cubes</h4>
                    <span className="text-xs font-bold text-[#F97316]">Low Stock</span>
                  </div>
                  <span className="inline-block px-2 py-1 text-[10px] bg-gray-100 dark:bg-[#1A1A1A] text-gray-600 dark:text-gray-400 rounded mb-4 font-medium">Crucial for Okra Soup</span>
                  
                  <div className="w-full h-0.5 bg-gray-200 dark:bg-[#2A2A2A]">
                    <div className="h-full bg-[#F97316]" style={{ width: '15%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Insight Box */}
            <div className="p-4 mt-8 border bg-green-50 border-green-100 rounded-xl dark:bg-[#0A1A12] dark:border-[#132A1C]">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-[#1CD05D]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <h5 className="text-xs font-bold tracking-wider text-gray-900 uppercase dark:text-white">BUDGET INSIGHT</h5>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Using your existing rice and oil saves you <span className="font-bold text-[#1CD05D]">₦2,100</span> on this week&apos;s meal plan.</p>
            </div>
          </div>

          {/* Need to recalculate card */}
          <div className="p-8 text-center bg-white border border-gray-200 rounded-2xl dark:bg-[#111111] dark:border-[#2A2A2A] shadow-sm">
            <div className="flex items-center justify-center w-10 h-10 mx-auto mb-4 text-gray-500 border border-gray-200 dark:border-gray-700 rounded-full dark:text-gray-400">
              <span className="text-lg italic font-serif">?</span>
            </div>
            <h4 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">Need to recalculate?</h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">Adjust your budget to see how meal recommendations change in real-time.</p>
            <button className="w-full py-3 text-sm font-bold tracking-wider text-white uppercase transition-colors bg-gray-900 rounded-xl hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
              Set New Limit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}