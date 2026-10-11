import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', className = '', showSubtitle = true }) => {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-3.5 ${className}`}>
      {/* Logo Badge Icon */}
      <div
        className={`${iconSizes[size]} bg-white dark:bg-white rounded-xl p-1.5 shadow-sm flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-800 transition-transform hover:scale-105`}
        title="BareBones"
      >
        <svg
          viewBox="0 0 100 120"
          className="w-full h-full fill-black text-black select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer B Shape */}
          <path
            d="M 18 10 
               C 18 10, 60 10, 72 22 
               C 82 32, 82 46, 72 56 
               C 86 66, 86 86, 72 98 
               C 60 108, 18 108, 18 108 
               Z"
            fill="#09090b"
          />

          {/* Top Bone Cutout in Upper Bowl */}
          {/* Bone top head: two rounded knobs + shaft */}
          <path
            d="M 40 24 
               C 35 24, 34 30, 39 34 
               C 42 36, 46 38, 48 42 
               C 48 46, 50 48, 52 48 
               C 54 48, 56 46, 56 42 
               C 58 38, 62 36, 65 34 
               C 70 30, 69 24, 64 24 
               C 59 24, 56 28, 52 28 
               C 48 28, 45 24, 40 24 Z"
            fill="#ffffff"
          />

          {/* Bottom Bone Cutout in Lower Bowl */}
          {/* Bone bottom inverted head */}
          <path
            d="M 52 68 
               C 50 68, 48 70, 48 74 
               C 46 78, 42 80, 39 82 
               C 34 86, 35 92, 40 92 
               C 45 92, 48 88, 52 88 
               C 56 88, 59 92, 64 92 
               C 69 92, 70 86, 65 82 
               C 62 80, 58 78, 56 74 
               C 56 70, 54 68, 52 68 Z"
            fill="#ffffff"
          />
        </svg>
      </div>

      {/* Brand Title and Subtitle */}
      <div>
        <div className="flex items-center gap-2">
          <span className={`font-extrabold tracking-tight text-slate-900 dark:text-white ${textSizes[size]}`}>
            BareBones
          </span>
          <span className="hidden sm:inline-block text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
            Survive ₹10k
          </span>
        </div>
        {showSubtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
            Every penny counts — survive the month on ₹10,000.
          </p>
        )}
      </div>
    </div>
  );
};
