import LoginForm from './LoginForm';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-white dark:bg-[#111111]">
      {/* Left Side Panel */}
      <div className="relative hidden w-1/2 lg:block"> 
        <div className="absolute inset-0 z-10 bg-black/20"></div> {/* Slightly lighter overlay so the food pops */}
        <Image 
          src="/login-image.svg" 
          alt="Healthy Meal" 
          fill 
          className="object-cover object-center" /* CHANGED BACK TO COVER */
          priority 
        />
        
        <div className="absolute bottom-0 left-0 right-0 z-20 p-12">
          {/* I also adjusted the blur card slightly to match your design perfectly */}
          <div className="p-8 backdrop-blur-md bg-white/10 rounded-2xl border border-white/20 max-w-md shadow-2xl">
            <h2 className="text-4xl font-bold text-white">Fuel your body,<br/>simplify your life.</h2>
            <p className="mt-4 text-lg text-gray-200">Access your personalized meal plans and smart grocery lists in one place.</p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <LoginForm />
    </div>
  );
}