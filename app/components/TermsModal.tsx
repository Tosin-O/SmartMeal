'use client';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TermsModal({ isOpen, onClose }: TermsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col bg-white dark:bg-[#111111] rounded-2xl shadow-2xl border border-gray-200 dark:border-[#2A2A2A] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-[#2A2A2A]">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-[#1CD05D]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Terms of Service</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">LAST UPDATED: MARCH 2026</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-[#1A1A1A]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body Layout */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Sidebar (Hidden on mobile) */}
          <div className="hidden md:flex flex-col w-1/3 border-r border-gray-200 dark:border-[#2A2A2A] p-6 overflow-y-auto bg-gray-50/50 dark:bg-[#161616]">
            <nav className="space-y-2 mb-8">
              <a href="#intro" className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-900 bg-white border rounded-lg dark:bg-[#1A1A1A] border-gray-200 dark:border-[#2A2A2A] dark:text-white shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#1CD05D]"></span>
                Introduction
              </a>
              <a href="#eligibility" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-[#1A1A1A] rounded-lg transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                1. User Eligibility
              </a>
              <a href="#health" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-[#1A1A1A] rounded-lg transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                2. Health Disclaimer
              </a>
              <a href="#budget" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-[#1A1A1A] rounded-lg transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                3. Budget Accuracy
              </a>
              <a href="#responsibility" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-[#1A1A1A] rounded-lg transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                4. Responsibility
              </a>
              <a href="#prohibited" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-[#1A1A1A] rounded-lg transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                5. Prohibited Use
              </a>
            </nav>

            <div className="p-4 mt-auto rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30">
              <h4 className="text-xs font-bold text-gray-900 uppercase dark:text-white mb-2">Legal Help</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">Have questions about these terms?</p>
              <button className="w-full px-4 py-2 text-xs font-bold text-gray-900 bg-white border border-gray-200 rounded-lg dark:bg-[#1A1A1A] dark:text-white dark:border-[#2A2A2A] hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors">
                CONTACT SUPPORT
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 md:p-10 overflow-y-auto scroll-smooth">
            <div className="max-w-2xl mx-auto space-y-10 text-gray-600 dark:text-gray-300">
              
              <section id="intro">
                <h3 className="flex items-center gap-2 mb-4 text-xl font-bold text-gray-900 dark:text-white">
                  <span className="w-2 h-2 rounded-full bg-[#1CD05D]"></span> Introduction
                </h3>
                <p className="mb-4 leading-relaxed">Welcome to SmartMeal. These Terms of Service (&quot;Terms&quot;) govern your access to and use of our meal planning, grocery list generation, and nutritional tracking services. By accessing or using SmartMeal, you agree to be bound by these Terms and our Privacy Policy.</p>
                <p className="leading-relaxed">Please read these terms carefully. If you do not agree to these terms, you may not access or use the services. SmartMeal reserves the right to update these terms at any time with notice to active users.</p>
              </section>

              <section id="eligibility">
                <h3 className="flex items-center gap-2 mb-4 text-xl font-bold text-gray-900 dark:text-white">
                  <span className="w-2 h-2 rounded-full bg-[#1CD05D]"></span> 1. User Eligibility
                </h3>
                <p className="mb-6 leading-relaxed">Our services are intended for users who are at least 13 years of age. By creating an account, you represent and warrant that you meet this age requirement. If you are under 18, you must have parental consent to use the platform.</p>
                
                <div className="p-5 border-l-4 rounded-r-xl border-[#1CD05D] bg-gray-50 dark:bg-[#1A1A1A] border-y border-r border-y-gray-200 border-r-gray-200 dark:border-y-[#2A2A2A] dark:border-r-[#2A2A2A]">
                  <h4 className="mb-1 font-bold text-gray-900 dark:text-white">Parental Control Notice</h4>
                  <p className="text-sm">SmartMeal does not knowingly collect data from children under 13. We encourage parents to supervise their teenagers&apos; use of nutritional and financial management tools.</p>
                </div>
              </section>

              <section id="health">
                <h3 className="flex items-center gap-2 mb-4 text-xl font-bold text-gray-900 dark:text-white">
                  <span className="w-2 h-2 rounded-full bg-[#1CD05D]"></span> 2. Health & Nutrition Disclaimer
                </h3>
                <div className="p-5 border rounded-xl border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/50">
                  <h4 className="flex items-center gap-2 mb-2 font-bold text-red-700 dark:text-red-400 uppercase text-sm tracking-wider">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    Critical: Not Medical Advice
                  </h4>
                  <p className="text-sm text-red-900 dark:text-red-200 leading-relaxed">SmartMeal provides automated nutritional information and meal suggestions based on generic data. We are <strong>not</strong> medical professionals, registered dietitians, or nutritionists. Users with severe allergies, dietary restrictions, or underlying medical conditions must consult a healthcare professional before modifying their diet based on our platform.</p>
                </div>
              </section>

              <section id="budget">
                <h3 className="flex items-center gap-2 mb-4 text-xl font-bold text-gray-900 dark:text-white">
                  <span className="w-2 h-2 rounded-full bg-[#1CD05D]"></span> 3. Budget Accuracy
                </h3>
                <p className="leading-relaxed">Meal cost estimates and budget optimization features are based on average market data localized to the Nigerian context. Real-world prices may vary significantly due to local market fluctuations, seasonal availability, and inflation. SmartMeal is not liable for any discrepancies between estimated and actual grocery costs.</p>
              </section>

              <section id="responsibility">
                <h3 className="flex items-center gap-2 mb-4 text-xl font-bold text-gray-900 dark:text-white">
                  <span className="w-2 h-2 rounded-full bg-[#1CD05D]"></span> 4. Account Responsibility
                </h3>
                <p className="leading-relaxed">You are solely responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.</p>
              </section>

              <section id="prohibited">
                <h3 className="flex items-center gap-2 mb-4 text-xl font-bold text-gray-900 dark:text-white">
                  <span className="w-2 h-2 rounded-full bg-[#1CD05D]"></span> 5. Prohibited Use
                </h3>
                <p className="mb-2 leading-relaxed">By using SmartMeal, you agree <strong>not</strong> to:</p>
                <ul className="pl-5 space-y-2 list-disc marker:text-[#1CD05D]">
                  <li>Use automated tools (bots, scrapers) to extract data from our food price databases.</li>
                  <li>Reverse-engineer, decompile, or attempt to extract the source code of our proprietary &quot;Pantry-First&quot; recommendation algorithm.</li>
                  <li>Use the service for any illegal or unauthorized purpose.</li>
                </ul>
              </section>

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50 dark:bg-[#111111] border-gray-200 dark:border-[#2A2A2A]">
          <div className="flex gap-4">
            <button className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              <span className="hidden sm:inline">Download PDF</span>
            </button>
            <button className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1A1A1A] rounded-lg transition-colors">
              Close
            </button>
            <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-white bg-[#1CD05D] rounded-lg hover:bg-[#15b04d] transition-colors shadow-lg shadow-green-500/20">
              I Agree
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}