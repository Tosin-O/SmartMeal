import Image from 'next/image';
import SignupForm from './SignupForm';

export default function SignupPage() {
  return (
    <div className="flex min-h-screen bg-white dark:bg-[#111111]">
      {/* Left Side Panel - Illustration */}
      <div className="relative hidden w-1/2 bg-[#EAD8C0] dark:bg-[#2A241D] lg:flex flex-col justify-end">
        {/* Replace with your illustration path */}
        <Image src="/signup-image.svg" alt="Happy woman with groceries" fill className="object-cover object-bottom" priority />
        
        <div className="relative z-20 p-12 w-full bg-linear-to-t from-black/80 to-transparent">
          <div className="flex items-center gap-2 mb-4 text-[#1CD05D]">
            {/* Logo */}
            <Image
                src="/logo.svg"
                alt="Logo"
                width={64}
                height={64}
         />
            <span className="text-xl font-bold text-white">SmartMeal</span>
          </div>
          <h2 className="text-4xl font-bold text-white">Start your healthy<br/>journey today.</h2>
          <p className="mt-4 text-gray-200">Join 10,000+ users planning smarter meals and saving time on grocery trips.</p>
          
          <div className="flex items-center gap-3 mt-8">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-black bg-gray-300"></div>
              <div className="w-8 h-8 rounded-full border-2 border-black bg-gray-400"></div>
              <div className="w-8 h-8 rounded-full border-2 border-black bg-gray-500"></div>
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