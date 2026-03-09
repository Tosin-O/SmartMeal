import Image from 'next/image';

interface SocialButtonProps {
  provider: string;
  iconPath: string; // e.g., '/google.svg' - place these in your public folder
}

export default function SocialButton({ provider, iconPath }: SocialButtonProps) {
  return (
    <button className="flex items-center justify-center w-full gap-3 py-2.5 rounded-lg border transition-colors bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-[#1A1A1A] dark:border-[#2A2A2A] dark:text-gray-200 dark:hover:bg-[#252525]">
      {/* Fallback geometric shape if image is missing, replace with your actual SVGs in public folder */}
      <div className="w-5 h-5  rounded-sm overflow-hidden flex items-center justify-center">
         <Image src={iconPath} alt={provider} width={20} height={20} className="object-contain" />
      </div>
      <span className="text-sm font-medium">{provider}</span>
    </button>
  );
}