import LoginForm from './LoginForm';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-white dark:bg-[#111111]">
      {/* Left Side Panel - Hidden on small screens */}
      <div className="relative hidden w-1/2 lg:block">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        {/* Replace with your actual food photo in public folder */}
        <Image src="/login-image.svg" alt="Healthy Meal" fill className="object-cover" priority />
        
        <div className="absolute bottom-0 left-0 right-0 z-20 p-12">
          <div className="p-8 backdrop-blur-md bg-white/10 rounded-2xl border border-white/20">
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