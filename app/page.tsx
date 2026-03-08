import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0A0A] selection:bg-[#1CD05D] selection:text-white overflow-x-hidden">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 w-full">
        {/* 1. Hero Section */}
        <section className="flex flex-col-reverse lg:flex-row items-center justify-between py-16 lg:py-24 gap-12">
          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-[#1CD05D] text-xs font-semibold tracking-wide uppercase mb-6 border border-green-200 dark:border-green-800">
              <span>✨ AI-Powered Meal Planning</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
              Eat Smarter.<br />
              <span className="text-[#1CD05D]">Save Faster.</span>
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-xl mx-auto lg:mx-0">
              Personalized meal plans that save you time and money by organizing your kitchen, your macros, and your grocery list in one smart app.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link href="/signup" className="w-full sm:w-auto px-8 py-4 text-lg font-bold text-white transition-colors rounded-xl bg-[#1CD05D] hover:bg-[#15b04d] flex items-center justify-center gap-2">
                Start Free Trial
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </Link>
              <Link href="#how-it-works" className="w-full sm:w-auto px-8 py-4 text-lg font-bold text-gray-900 dark:text-white bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] rounded-xl hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors text-center">
                How it works
              </Link>
            </div>
            
            {/* Social Proof */}
            <div className="flex items-center justify-center lg:justify-start gap-4 mt-10">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full border-2 border-white dark:border-[#0A0A0A] bg-gray-300"></div>
                <div className="w-10 h-10 rounded-full border-2 border-white dark:border-[#0A0A0A] bg-gray-400"></div>
                <div className="w-10 h-10 rounded-full border-2 border-white dark:border-[#0A0A0A] bg-gray-500"></div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Trusted by <span className="font-bold text-gray-900 dark:text-white">40,000+</span> home cooks.
              </p>
            </div>
          </div>

          {/* Hero Image / Mockup */}
          <div className="flex-1 relative w-full max-w-2xl">
            {/* Replace /hero-food.jpg with your actual food image */}
            <div className="relative aspect-square lg:aspect-4/3 w-full rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-[#2A2A2A]">
              <Image src="/homefood.svg" alt="Healthy fresh food" fill className="object-cover" priority />
            </div>
            
            {/* Floating Card exactly like your mockup */}
            <div className="absolute -bottom-6 lg:-bottom-10 lg:-left-10 left-4 right-4 lg:right-auto bg-white/90 dark:bg-[#1A1A1A]/90 backdrop-blur-md p-4 rounded-xl shadow-xl border border-gray-200 dark:border-[#2A2A2A] flex items-center justify-between min-w-[300px]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-[#1CD05D]">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tuesday's Plan</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Grilled Salmon & Quinoa</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[#1CD05D] font-bold text-sm">450 kcal</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">25m Prep Time</p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Stats Section */}
        <section className="py-16 border-y border-gray-200 dark:border-gray-800 my-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <h3 className="text-3xl lg:text-5xl font-extrabold text-[#1CD05D]">50k+</h3>
              <p className="mt-2 text-xs font-bold tracking-widest text-gray-500 uppercase">Active Users</p>
            </div>
            <div>
              <h3 className="text-3xl lg:text-5xl font-extrabold text-[#1CD05D]">1M+</h3>
              <p className="mt-2 text-xs font-bold tracking-widest text-gray-500 uppercase">Meals Planned</p>
            </div>
            <div>
              <h3 className="text-3xl lg:text-5xl font-extrabold text-[#1CD05D]">$200</h3>
              <p className="mt-2 text-xs font-bold tracking-widest text-gray-500 uppercase">Monthly Savings</p>
            </div>
            <div>
              <h3 className="text-3xl lg:text-5xl font-extrabold text-[#1CD05D]">4.9/5</h3>
              <p className="mt-2 text-xs font-bold tracking-widest text-gray-500 uppercase">User Rating</p>
            </div>
          </div>
        </section>

        {/* 3. Features Section */}
        <section className="py-20">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white mb-6">Why Choose SmartMeal?</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Our intelligent platform handles the heavy lifting of meal planning so you can focus on enjoying healthy, delicious food.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-[#2A2A2A] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 dark:bg-[#111111] border dark:border-[#2A2A2A] rounded-xl flex items-center justify-center text-[#1CD05D] mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Auto-generated Lists</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">Syncs instantly with your weekly plan to ensure you never miss an ingredient. Sorted by grocery aisle for maximum speed.</p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-[#2A2A2A] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 dark:bg-[#111111] border dark:border-[#2A2A2A] rounded-xl flex items-center justify-center text-[#1CD05D] mb-6">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Dietary Preferences</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">AI-driven suggestions for Keto, Vegan, Paleo, and more. We learn your tastes and allergies to provide perfect recommendations.</p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-[#2A2A2A] shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 dark:bg-[#111111] border dark:border-[#2A2A2A] rounded-xl flex items-center justify-center text-[#1CD05D] mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Waste Reduction</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">Smart inventory tracking helps you use what you have and buy only what you need. Save the planet and your wallet.</p>
            </div>
          </div>
        </section>

        {/* 4. Product Demo Section */}
        <section className="py-20 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white mb-2">Plan Your Week</h2>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-[#1CD05D] mb-8">In Seconds.</h2>
            
            <ul className="space-y-8 mb-10">
              <li className="flex gap-4">
                <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-[#1CD05D]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">One-Click Recipe Import</h4>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">Import recipes from any blog or website with our smart browser extension.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-[#1CD05D]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">Nutrition Tracking</h4>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">Automatic macro tracking for every meal in your plan. Syncs with Apple Health.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-[#1CD05D]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">Family Sharing</h4>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">Collaborate on meal plans and grocery lists with everyone in your household.</p>
                </div>
              </li>
            </ul>

            <Link href="#features" className="inline-block px-6 py-3 font-semibold text-white bg-gray-900 dark:bg-[#1A1A1A] dark:border dark:border-[#2A2A2A] rounded-lg hover:bg-gray-800 dark:hover:bg-[#252525] transition-colors">
              Explore All Features
            </Link>
          </div>

          <div className="flex-1 w-full relative">
            {/* Simulated UI Window */}
            <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#2A2A2A] rounded-2xl shadow-2xl p-6 relative overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white">Weekly Calendar</h4>
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {/* Column 1 */}
                <div className="space-y-4">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Monday</div>
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 p-3 rounded-lg">
                    <div className="text-[10px] text-[#1CD05D] font-bold uppercase">Breakfast</div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white mt-1">Avocado Toast</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-[#1A1A1A] border border-gray-100 dark:border-[#2A2A2A] p-3 rounded-lg">
                    <div className="text-[10px] text-gray-500 uppercase">Lunch</div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white mt-1">Greek Salad</div>
                  </div>
                </div>
                {/* Column 2 */}
                <div className="space-y-4 opacity-50">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tuesday</div>
                  <div className="bg-gray-50 dark:bg-[#1A1A1A] border border-gray-100 dark:border-[#2A2A2A] p-3 rounded-lg">
                    <div className="text-[10px] text-gray-500 uppercase">Breakfast</div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white mt-1">Oatmeal</div>
                  </div>
                  <div className="bg-gray-50 dark:bg-[#1A1A1A] border border-gray-100 dark:border-[#2A2A2A] p-3 rounded-lg">
                    <div className="text-[10px] text-gray-500 uppercase">Lunch</div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white mt-1">Lentil Soup</div>
                  </div>
                </div>
                 {/* Column 3 */}
                 <div className="space-y-4 opacity-30">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Wednesday</div>
                  <div className="bg-gray-50 dark:bg-[#1A1A1A] border border-gray-100 dark:border-[#2A2A2A] p-3 rounded-lg">
                    <div className="text-[10px] text-gray-500 uppercase">Breakfast</div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white mt-1">Smoothie</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating UI Element representing a list */}
            <div className="absolute -bottom-8 -right-4 lg:-right-8 bg-white dark:bg-[#1A1A1A] p-5 rounded-xl shadow-2xl border border-gray-200 dark:border-[#2A2A2A] w-48">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-5 h-5 text-[#1CD05D]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                <span className="font-bold text-gray-900 dark:text-white">Grocery List</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border border-[#1CD05D] bg-[#1CD05D] flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 line-through">Organic Quinoa</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600"></div>
                  <span className="text-xs text-gray-700 dark:text-gray-300">Red Apples</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600"></div>
                  <span className="text-xs text-gray-700 dark:text-gray-300">Avocados (x2)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. CTA Section */}
        <section className="py-20">
          <div className="relative overflow-hidden rounded-3xl bg-gray-900 dark:bg-[#0A1A12] border border-gray-800 dark:border-green-900/30 text-center px-6 py-16 lg:py-24">
            {/* Decorative background gradient specific to dark mode design */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 dark:from-[#0F2A1C] dark:to-[#0A0A0A] opacity-50 z-0"></div>
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-6">Ready to simplify your meal planning?</h2>
              <p className="text-lg text-gray-300 mb-10">
                Join 50,000+ others who are saving time, eating healthier, and reducing food waste every single day.
              </p>
              <div className="flex flex-col items-center justify-center gap-4">
                <Link href="/signup" className="px-8 py-4 text-lg font-bold text-white transition-colors rounded-xl bg-[#1CD05D] hover:bg-[#15b04d]">
                  Get Started for Free
                </Link>
                <p className="text-sm text-gray-400">No credit card required • 14-day free trial</p>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}