'use client';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white dark:bg-[#111111] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#2A2A2A] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-[#2A2A2A]">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-[#1CD05D]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Privacy Policy</h2>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">NDPR Compliant • Last Updated: March 2026</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-[#1A1A1A]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto scroll-smooth">
          <div className="space-y-10 text-gray-600 dark:text-gray-300">
            
            <section>
              <h3 className="flex items-center gap-2 mb-4 text-lg font-bold text-gray-900 dark:text-white">
                <span className="w-2 h-2 rounded-full bg-[#1CD05D]"></span> 1. Introduction
              </h3>
              <p className="leading-relaxed text-sm">SmartMeal is committed to protecting your personal data. This policy outlines how we collect, use, and safeguard your information in accordance with the <strong>Nigeria Data Protection Regulation (NDPR)</strong>. By using our service, you agree to the practices described below.</p>
            </section>

            <section>
              <h3 className="flex items-center gap-2 mb-4 text-lg font-bold text-gray-900 dark:text-white">
                <span className="w-2 h-2 rounded-full bg-[#1CD05D]"></span> 2. Data Collection
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 border rounded-xl border-gray-200 dark:border-[#2A2A2A] bg-gray-50/50 dark:bg-[#161616]">
                  <h4 className="flex items-center gap-2 mb-2 text-sm font-bold text-gray-900 dark:text-white">
                    <svg className="w-4 h-4 text-[#1CD05D]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    Account & Profile
                  </h4>
                  <p className="text-xs leading-relaxed">Email, name, household size, and input financial budgets to personalize planning.</p>
                </div>
                <div className="p-4 border rounded-xl border-gray-200 dark:border-[#2A2A2A] bg-gray-50/50 dark:bg-[#161616]">
                  <h4 className="flex items-center gap-2 mb-2 text-sm font-bold text-gray-900 dark:text-white">
                    <svg className="w-4 h-4 text-[#1CD05D]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    Dietary Data
                  </h4>
                  <p className="text-xs leading-relaxed">Food allergies, health restrictions, and taste preferences for safe meal suggestions.</p>
                </div>
                <div className="p-4 border rounded-xl border-gray-200 dark:border-[#2A2A2A] bg-gray-50/50 dark:bg-[#161616]">
                  <h4 className="flex items-center gap-2 mb-2 text-sm font-bold text-gray-900 dark:text-white">
                    <svg className="w-4 h-4 text-[#1CD05D]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Location Data
                  </h4>
                  <p className="text-xs leading-relaxed">Coarse location to align our algorithms with relevant Nigerian market pricing.</p>
                </div>
                <div className="p-4 border rounded-xl border-gray-200 dark:border-[#2A2A2A] bg-gray-50/50 dark:bg-[#161616]">
                  <h4 className="flex items-center gap-2 mb-2 text-sm font-bold text-gray-900 dark:text-white">
                    <svg className="w-4 h-4 text-[#1CD05D]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                    Pantry Items
                  </h4>
                  <p className="text-xs leading-relaxed">User-inputted inventory levels to minimize waste and optimize shopping lists.</p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="flex items-center gap-2 mb-4 text-lg font-bold text-gray-900 dark:text-white">
                <span className="w-2 h-2 rounded-full bg-[#1CD05D]"></span> 3. How We Use Your Data
              </h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#1CD05D] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span><strong>Algorithm Improvement:</strong> Anonymized and aggregated data is used strictly internally to train our &quot;Pantry-First&quot; recommendation engine. We do not sell your personal data to third parties.</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#1CD05D] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span><strong>Budget Optimization:</strong> Matching local market prices with your specific household budget goals to provide accurate planning.</span>
                </li>
              </ul>
            </section>

            <section>
              <div className="p-6 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30">
                <h3 className="flex items-center gap-2 mb-4 text-lg font-bold text-gray-900 dark:text-white">
                  <svg className="w-5 h-5 text-[#1CD05D]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
                  4. NDPR Compliance & Rights
                </h3>
                <ul className="space-y-3 text-sm font-medium">
                  <li className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-6 h-6 text-xs text-white bg-[#1CD05D] rounded">01</span>
                    <strong>Right to Access:</strong> Request a copy of your personal data at any time.
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-6 h-6 text-xs text-white bg-[#1CD05D] rounded">02</span>
                    <strong>Right to Rectification:</strong> Update or correct inaccurate data via settings.
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-6 h-6 text-xs text-white bg-[#1CD05D] rounded">03</span>
                    <strong>Right to Portability:</strong> Export your data in machine-readable formats.
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="flex items-center gap-2 mb-4 text-lg font-bold text-gray-900 dark:text-white">
                <span className="w-2 h-2 rounded-full bg-[#1CD05D]"></span> 5. Data Retention & Deletion
              </h3>
              <p className="text-sm leading-relaxed mb-4">We retain data as long as your account is active. You have the <strong>Right to be Forgotten</strong>.</p>
              <div className="flex items-center gap-3 p-3 border rounded-lg border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/50 text-red-700 dark:text-red-400">
                 <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                 <p className="text-xs"><strong>Deletion Request:</strong> You can delete your account at any time. Upon request, all PII, pantry inventory, and budget history will be permanently purged.</p>
              </div>
            </section>

          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50 dark:bg-[#111111] border-gray-200 dark:border-[#2A2A2A]">
          <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
            By clicking Accept, you agree to our <button onClick={onClose} className="text-[#1CD05D] hover:underline">Terms of Service</button>.
          </p>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1A1A1A] rounded-lg transition-colors">
              Decline
            </button>
            <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-white bg-[#1CD05D] rounded-lg hover:bg-[#15b04d] transition-colors shadow-lg shadow-green-500/20">
              Accept & Continue
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}