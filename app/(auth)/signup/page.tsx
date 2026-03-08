import SignupForm from './SignupForm';
import Image from 'next/image';

export default function SignupPage() {
  return (
    <div className="flex min-h-screen bg-white dark:bg-[#111111]">
      {/* Left Side Panel - Illustration */}
      {/* (Keep your existing background color classes) */}
      <div className="relative hidden w-1/2 bg-[#EAD8C0] dark:bg-[#2A241D] lg:flex flex-col justify-end">
        <Image 
          src="/signup-illustration.png" 
          alt="Happy woman with groceries" 
          fill 
          className="object-cover object-top" /* <--- CHANGE THIS LINE to object-top */
          priority 
        />
        
        <div className="relative z-20 w-full p-12 bg-linear-to-t from-black/90 via-black/50 to-transparent">
          <div className="flex items-center gap-2 mb-4 text-[#1CD05D]">
            <Image
                src="/logo.svg"
                alt="Logo"
                width={56}
                height={56}
         />
            <span className="text-xl font-bold text-white">SmartMeal</span>
          </div>
          <h2 className="text-4xl font-bold text-white">Start your healthy<br/>journey today.</h2>
          <p className="mt-4 text-gray-200">Join 10,000+ users planning smarter meals and saving time on grocery trips.</p>
          
          <div className="flex items-center gap-3 mt-8">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 bg-gray-300 border-2 border-black rounded-full"></div>
              <div className="w-8 h-8 bg-gray-400 border-2 border-black rounded-full"></div>
              <div className="w-8 h-8 bg-gray-500 border-2 border-black rounded-full"></div>
            </div>
            <span className="text-sm font-medium text-white">Free 14-day trial included</span>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <SignupForm />
    </div>
  );
}