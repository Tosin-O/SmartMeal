'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { doc, getDoc, setDoc } from 'firebase/firestore'; 
import { db, auth } from '@/lib/firebase';

export default function UserSetupWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true); 
  
  const [formData, setFormData] = useState({
    // Step 1: Profile (Campus location removed)
    displayName: '',
    cookingSkill: 'Beginner',
    
    // Step 2: Diet
    dietType: 'None',
    allergies: [] as string[],
    
    // Step 3: Budget & Goals
    budgetPeriod: 'Weekly',
    budgetAmount: '',
    primaryGoal: 'Save Money',
  });

  // --- THE GATEKEEPER ---
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists() && userDocSnap.data().onboardingCompleted) {
          router.push('/dashboard');
        } else {
          setIsPageLoading(false);
        }
      } catch (error) {
        console.error("Error checking user status:", error);
        setIsPageLoading(false); 
      }
    });

    return () => unsubscribe();
  }, [router]);

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleAllergyToggle = (allergy: string) => {
    setFormData((prev) => ({
      ...prev,
      allergies: prev.allergies.includes(allergy)
        ? prev.allergies.filter((a) => a !== allergy)
        : [...prev.allergies, allergy],
    }));
  };

  const handleCompleteSetup = async () => {
    setIsSubmitting(true);
    
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const userId = currentUser.uid;

      await setDoc(doc(db, 'users', userId), {
        ...formData,
        email: currentUser.email,
        budgetAmount: Number(formData.budgetAmount),
        createdAt: new Date(),
        onboardingCompleted: true 
      }, { merge: true });

      router.push('/dashboard'); 
      
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Something went wrong saving your profile. Please try again.");
      setIsSubmitting(false); 
    }
  };

  // --- LOADING STATE ---
  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center">
        <Image src="/logo.svg" alt="SmartMeal Logo" width={48} height={48} className="animate-pulse mb-4 opacity-50" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col selection:bg-[#1CD05D] selection:text-white">
      
      <header className="p-6 flex items-center">
        <div className="flex items-center gap-2 text-[#1CD05D]">
          <Image src="/logo.svg" alt="SmartMeal Logo" width={32} height={32} />
          <span className="text-xl font-bold text-white">SmartMeal</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-xl">
          
          <div className="mb-8 h-20 text-center">
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Welcome to SmartMeal! 🥘</h2>
                <p className="text-gray-400 text-sm md:text-base">Let&apos;s personalize your experience.</p>
              </div>
            )}
            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Dietary Preferences 🥗</h2>
                <p className="text-gray-400 text-sm md:text-base">We&apos;ll filter the recipes and menus to match your lifestyle.</p>
              </div>
            )}
            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Set Your Goals 💰</h2>
                <p className="text-gray-400 text-sm md:text-base">Our algorithm works best when it knows your budget limits.</p>
              </div>
            )}
          </div>

          <div className="mb-8">
            <div className="flex gap-2 h-1.5">
              <div className={`flex-1 rounded-full transition-colors duration-500 ${step >= 1 ? 'bg-[#1CD05D]' : 'bg-[#2A2A2A]'}`}></div>
              <div className={`flex-1 rounded-full transition-colors duration-500 ${step >= 2 ? 'bg-[#1CD05D]' : 'bg-[#2A2A2A]'}`}></div>
              <div className={`flex-1 rounded-full transition-colors duration-500 ${step >= 3 ? 'bg-[#1CD05D]' : 'bg-[#2A2A2A]'}`}></div>
            </div>
          </div>

          <div className="bg-[#111111] border border-[#2A2A2A] rounded-2xl p-8 md:p-10 shadow-2xl relative overflow-hidden min-h-95 flex flex-col">
            
            {step === 1 && (
              <div className="animate-in slide-in-from-right-8 fade-in duration-500 flex-1 flex flex-col justify-center">
                <div className="space-y-8 flex-1">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-3">Preferred Display Name</label>
                    <input 
                      type="text" 
                      value={formData.displayName}
                      onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                      placeholder="e.g. Chef Alex"
                      className="w-full p-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl text-white focus:border-[#1CD05D] outline-none transition-colors text-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-3">Cooking Skill Level</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['Beginner', 'Intermediate', 'Pro'].map((skill) => (
                        <button
                          key={skill}
                          onClick={() => setFormData({...formData, cookingSkill: skill})}
                          className={`py-4 text-sm font-bold rounded-xl border transition-all ${
                            formData.cookingSkill === skill 
                              ? 'bg-[#13251A] border-[#1CD05D] text-[#1CD05D]' 
                              : 'bg-[#1A1A1A] border-[#2A2A2A] text-gray-400 hover:border-gray-500'
                          }`}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-in slide-in-from-right-8 fade-in duration-500 flex-1 flex flex-col">
                <div className="space-y-8 flex-1">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-3">Diet Type</label>
                    <div className="flex flex-wrap gap-3">
                      {['None', 'Vegetarian', 'Vegan', 'Keto', 'Halal'].map((diet) => (
                        <button
                          key={diet}
                          onClick={() => setFormData({...formData, dietType: diet})}
                          className={`px-5 py-2.5 text-sm font-bold rounded-full border transition-all ${
                            formData.dietType === diet 
                              ? 'bg-[#13251A] border-[#1CD05D] text-[#1CD05D]' 
                              : 'bg-[#1A1A1A] border-[#2A2A2A] text-gray-400 hover:border-gray-500'
                          }`}
                        >
                          {diet}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-3">Allergies & Intolerances</label>
                    <div className="flex flex-wrap gap-3">
                      {['Peanuts', 'Seafood', 'Dairy', 'Gluten', 'Eggs', 'Soy'].map((allergy) => {
                        const isSelected = formData.allergies.includes(allergy);
                        return (
                          <button
                            key={allergy}
                            onClick={() => handleAllergyToggle(allergy)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all flex items-center gap-2 ${
                              isSelected 
                                ? 'bg-red-950/30 border-red-500/50 text-red-400' 
                                : 'bg-[#1A1A1A] border-[#2A2A2A] text-gray-400 hover:border-gray-500'
                            }`}
                          >
                            {isSelected && <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                            {allergy}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-gray-500 mt-3">Select all that apply. Recipes containing these will be heavily flagged.</p>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-in slide-in-from-right-8 fade-in duration-500 flex-1 flex flex-col">
                <div className="space-y-8 flex-1">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-3">Primary Goal</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['Save Money', 'Eat Healthier', 'Gain Muscle', 'Time Efficiency'].map((goal) => (
                        <button
                          key={goal}
                          onClick={() => setFormData({...formData, primaryGoal: goal})}
                          className={`py-3 text-sm font-bold rounded-lg border transition-all ${
                            formData.primaryGoal === goal 
                              ? 'bg-[#13251A] border-[#1CD05D] text-[#1CD05D]' 
                              : 'bg-[#1A1A1A] border-[#2A2A2A] text-gray-400 hover:border-gray-500'
                          }`}
                        >
                          {goal}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Budget Period</label>
                      <div className="relative">
                        <select 
                          value={formData.budgetPeriod}
                          onChange={(e) => setFormData({...formData, budgetPeriod: e.target.value})}
                          className="w-full p-3.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#1CD05D] outline-none appearance-none transition-colors"
                        >
                          <option value="Weekly">Weekly</option>
                          <option value="Monthly">Monthly</option>
                        </select>
                        <svg className="absolute w-4 h-4 text-gray-500 transform -translate-y-1/2 pointer-events-none right-4 top-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                    <div className="flex-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Target Amount (₦)</label>
                      <input 
                        type="number" 
                        value={formData.budgetAmount}
                        onChange={(e) => setFormData({...formData, budgetAmount: e.target.value})}
                        placeholder="e.g. 25000"
                        className="w-full p-3.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-white font-bold text-lg focus:border-[#1CD05D] outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-[#2A2A2A] flex items-center justify-between">
              {step > 1 ? (
                <button 
                  onClick={prevStep}
                  disabled={isSubmitting}
                  className="px-6 py-3 text-sm font-bold text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                >
                  Back
                </button>
              ) : <div></div>}
              
              {step < 3 ? (
                <button 
                  onClick={nextStep}
                  className="px-8 py-3 text-sm font-bold text-gray-900 bg-[#1CD05D] hover:bg-[#15b04d] rounded-lg transition-colors"
                >
                  Continue
                </button>
              ) : (
                <button 
                  onClick={handleCompleteSetup}
                  disabled={isSubmitting || !formData.budgetAmount || !formData.displayName}
                  className="px-8 py-3 text-sm font-bold text-gray-900 bg-[#1CD05D] hover:bg-[#15b04d] rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving Profile...' : 'Complete Setup'}
                  {!isSubmitting && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </button>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}