'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function GlobalSettings() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Config State
  const [activeTab, setActiveTab] = useState('LOCALIZATION');
  const [currency, setCurrency] = useState('Nigerian Naira (₦)');
  const [unit, setUnit] = useState('Metric (kg, L)');
  
  // Campus & Local Market Offsets (Replaced broad regions with PAU/Lagos specifics)
  const [marketOffset, setMarketOffset] = useState(0); // Base market prices (e.g., Ibeju-Lekki/Ajah markets)
  const [cafeteriaMarkup, setCafeteriaMarkup] = useState(5); // Additional markup for on-campus vendors
  const [hostelDelivery, setHostelDelivery] = useState(2); // Small percentage fee for hostel deliveries

  // System Controls State
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [pantryPriority, setPantryPriority] = useState(true);
  const [subThreshold, setSubThreshold] = useState('15');

  // UI State
  const [showSaveAlert, setShowSaveAlert] = useState(false);

  // Fetch settings on mount
  useEffect(() => {
    async function fetchSettings() {
      try {
        const docRef = doc(db, 'app_metadata', 'global_settings');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setCurrency(data.currency || 'Nigerian Naira (₦)');
          setUnit(data.unit || 'Metric (kg, L)');
          setMarketOffset(data.marketOffset || 0);
          setCafeteriaMarkup(data.cafeteriaMarkup || 5);
          setHostelDelivery(data.hostelDelivery || 2);
          setMaintenanceMode(data.maintenanceMode || false);
          setPantryPriority(data.pantryPriority ?? true);
          setSubThreshold(data.subThreshold || '15');
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const docRef = doc(db, 'app_metadata', 'global_settings');
      await setDoc(docRef, {
        currency,
        unit,
        marketOffset,
        cafeteriaMarkup,
        hostelDelivery,
        maintenanceMode,
        pantryPriority,
        subThreshold,
        lastUpdated: new Date()
      }, { merge: true });

      setShowSaveAlert(true);
      setTimeout(() => setShowSaveAlert(false), 4000);
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-[#1CD05D] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-400 mx-auto w-full animate-in fade-in duration-500">
      
      {/* 1. Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-gray-500 uppercase">
          <span>ADMIN</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="text-gray-300">GLOBAL SETTINGS</span>
        </div>
        
        <div className="flex gap-3">
          <button className="p-2 text-gray-400 bg-[#111111] border border-[#2A2A2A] rounded-lg hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </button>
          <button className="p-2 text-gray-400 bg-[#111111] border border-[#2A2A2A] rounded-lg hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          </button>
        </div>
      </header>

      {/* 2. Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* System Status */}
        <div className="p-6 bg-[#111111] border border-[#2A2A2A] rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">SYSTEM STATUS</h3>
            <svg className="w-4 h-4 text-[#1CD05D]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className={`text-2xl font-bold ${maintenanceMode ? 'text-yellow-500' : 'text-white'}`}>
              {maintenanceMode ? 'Maintenance' : 'Operational'}
            </p>
            <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase tracking-wider ${maintenanceMode ? 'bg-yellow-950/30 text-yellow-500' : 'bg-[#13251A] text-[#1CD05D]'}`}>
              {maintenanceMode ? 'Holding Page' : '99.9% Uptime'}
            </span>
          </div>
        </div>

        {/* API Latency */}
        <div className="p-6 bg-[#111111] border border-[#2A2A2A] rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">ALGORITHM PRIORITY</h3>
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-2xl font-bold text-white">{pantryPriority ? 'Pantry-First' : 'Standard'}</p>
            <span className="px-2 py-1 text-[10px] font-bold text-gray-400 bg-[#1A1A1A] border border-[#2A2A2A] rounded uppercase tracking-wider">Active</span>
          </div>
        </div>

        {/* Last Sync */}
        <div className="p-6 bg-[#111111] border border-[#2A2A2A] rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">SUBSTITUTION THRESHOLD</h3>
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-2xl font-bold text-white">{subThreshold}%</p>
            <span className="px-2 py-1 text-[10px] font-bold text-gray-400 bg-[#1A1A1A] border border-[#2A2A2A] rounded uppercase tracking-wider">Variance</span>
          </div>
        </div>
      </div>

      {/* 3. Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        
        {/* Left Column (General Configuration) */}
        <div className="xl:col-span-2 bg-[#111111] border border-[#2A2A2A] rounded-2xl overflow-hidden">
          
          <div className="p-6 pb-0 border-b border-[#2A2A2A]">
            <h2 className="text-sm font-bold tracking-wider text-white uppercase mb-6">GENERAL CONFIGURATION</h2>
            
            <div className="flex gap-6 text-xs font-bold tracking-widest uppercase">
              {['LOCALIZATION', 'ALGORITHM TOGGLES', 'SECURITY'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 border-b-2 transition-colors ${activeTab === tab ? 'border-[#1CD05D] text-[#1CD05D]' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="p-8 space-y-10">
            {/* Row 1: Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-3">BASE CURRENCY</label>
                <div className="relative">
                  <select 
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full py-3.5 pl-4 pr-10 text-sm font-medium text-white bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg appearance-none outline-none focus:border-[#1CD05D]"
                  >
                    <option>Nigerian Naira (₦)</option>
                    <option>US Dollar ($)</option>
                    <option>British Pound (£)</option>
                  </select>
                  <svg className="absolute w-4 h-4 text-gray-500 transform -translate-y-1/2 pointer-events-none right-4 top-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-3">MEASUREMENT UNITS</label>
                <div className="flex p-1 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg">
                  <button 
                    onClick={() => setUnit('Metric (kg, L)')}
                    className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-colors ${unit === 'Metric (kg, L)' ? 'bg-[#2A2A2A] text-white' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    Metric (kg, L)
                  </button>
                  <button 
                    onClick={() => setUnit('Standard (oz, lb)')}
                    className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-colors ${unit === 'Standard (oz, lb)' ? 'bg-[#2A2A2A] text-white' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    Standard (lb, oz)
                  </button>
                </div>
              </div>
            </div>

            {/* Row 2: Campus Price Offsets */}
            <div>
              <label className="block text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-1">CAMPUS & VENDOR MARKUPS</label>
              <p className="text-sm text-gray-400 mb-8">Adjust platform-wide pricing multipliers for local markets and on-campus delivery logistics.</p>

              <div className="space-y-8">
                {/* Local Market Base Slider */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-bold text-white">Local Market Offset (Ibeju-Lekki/Epe)</span>
                    <span className={`text-sm font-bold ${marketOffset > 0 ? 'text-[#1CD05D]' : 'text-gray-500'}`}>{marketOffset > 0 ? `+${marketOffset}%` : '0%'}</span>
                  </div>
                  <input 
                    type="range" min="0" max="20" value={marketOffset} onChange={(e) => setMarketOffset(Number(e.target.value))}
                    className="w-full h-1 bg-[#2A2A2A] rounded-lg appearance-none cursor-pointer accent-[#1CD05D]" 
                  />
                </div>

                {/* Cafeteria Markup Slider */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-bold text-white">On-Campus Cafeteria Markup</span>
                    <span className="text-sm font-bold text-[#1CD05D]">+{cafeteriaMarkup}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="20" value={cafeteriaMarkup} onChange={(e) => setCafeteriaMarkup(Number(e.target.value))}
                    className="w-full h-1 bg-[#2A2A2A] rounded-lg appearance-none cursor-pointer accent-[#1CD05D]" 
                  />
                </div>

                {/* Hostel Delivery Slider */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-bold text-white">Hostel Delivery Surcharge</span>
                    <span className="text-sm font-bold text-[#1CD05D]">+{hostelDelivery}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="20" value={hostelDelivery} onChange={(e) => setHostelDelivery(Number(e.target.value))}
                    className="w-full h-1 bg-[#2A2A2A] rounded-lg appearance-none cursor-pointer accent-[#1CD05D]" 
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column (System Controls) */}
        <div>
          <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-6 md:p-8">
            <h2 className="text-sm font-bold tracking-wider text-white uppercase mb-8">SYSTEM CONTROLS</h2>

            <div className="space-y-8 mb-8">
              
              {/* Maintenance Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">Maintenance Mode</h4>
                  <p className="text-xs text-gray-500">Redirect users to holding page.</p>
                </div>
                <div 
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${maintenanceMode ? 'bg-[#1CD05D]' : 'bg-[#2A2A2A]'}`}
                  onClick={() => setMaintenanceMode(!maintenanceMode)}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${maintenanceMode ? 'left-7' : 'left-1'}`}></div>
                </div>
              </div>

              {/* Pantry Priority Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">Pantry-First Priority</h4>
                  <p className="text-xs text-gray-500">Weight owned items higher.</p>
                </div>
                <div 
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${pantryPriority ? 'bg-[#1CD05D]' : 'bg-[#2A2A2A]'}`}
                  onClick={() => setPantryPriority(!pantryPriority)}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all flex items-center justify-center ${pantryPriority ? 'left-7' : 'left-1'}`}>
                     {pantryPriority && <svg className="w-3 h-3 text-[#1CD05D]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                </div>
              </div>

              {/* Substitution Threshold Input */}
              <div className="pt-2">
                <label className="block text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-3">SUBSTITUTION THRESHOLD</label>
                <div className="relative mb-2">
                  <input 
                    type="number" 
                    value={subThreshold}
                    onChange={(e) => setSubThreshold(e.target.value)}
                    className="w-full py-3.5 pl-4 pr-12 text-sm font-bold text-white bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg outline-none focus:border-[#1CD05D]"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
                </div>
                <p className="text-[10px] text-gray-500">Recommended value for current inflation: 12-18%</p>
              </div>
            </div>

            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="w-full py-3.5 text-sm font-bold text-gray-900 transition-colors rounded-xl bg-[#1CD05D] hover:bg-[#15b04d] uppercase tracking-wider mb-4 disabled:opacity-50"
            >
              {isSaving ? 'SAVING...' : 'SAVE GLOBAL CHANGES'}
            </button>
            <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase text-center">
              CHANGES APPLY TO ALL CAMPUS USERS INSTANTLY
            </p>
          </div>
        </div>

      </div>

      {/* Floating Toast Alert */}
      {showSaveAlert && (
        <div className="fixed bottom-8 right-8 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="p-4 flex items-start gap-4 bg-[#111111] border border-[#2A2A2A] rounded-xl shadow-2xl min-w-[320px]">
            <div className="w-8 h-8 rounded-full bg-[#13251A] flex items-center justify-center shrink-0 text-[#1CD05D]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            <div className="flex-1 pr-6">
              <h4 className="text-sm font-bold text-[#1CD05D] mb-0.5">Settings Updated</h4>
              <p className="text-xs text-gray-400">Campus and delivery settings have been saved to the database.</p>
            </div>
            <button onClick={() => setShowSaveAlert(false)} className="text-gray-500 hover:text-white mt-0.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}