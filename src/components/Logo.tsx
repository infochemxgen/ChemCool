import React from 'react';
import { cn } from '../lib/utils';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Logo: React.FC<LogoProps> = ({ className, iconOnly = false, size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-12',
    xl: 'h-20',
  };

  const iconSizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-20 h-20',
  };

  const textClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl',
    xl: 'text-5xl',
  };

  return (
    <div className={cn("flex items-center gap-3 select-none group", className)}>
      {/* Hexagonal Molecular Icon */}
      <div className={cn("relative flex items-center justify-center transition-transform duration-500 group-hover:rotate-12", iconSizeClasses[size])}>
        {/* Outer Hexagon (Benzene Ring Style) */}
        <svg 
          viewBox="0 0 100 100" 
          className="absolute inset-0 w-full h-full drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]"
        >
          <path 
            d="M50 5 L90 27.5 V72.5 L50 95 L10 72.5 V27.5 L50 5 Z" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="4"
            className="text-accent-emerald/20"
          />
          <path 
            d="M50 12 L82 30 V70 L50 88 L18 70 V30 L50 12 Z" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="8"
            className="text-accent-emerald"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Inner "X" / Molecular Bond Structure */}
          <path 
            d="M35 35 L65 65 M65 35 L35 65" 
            stroke="currentColor" 
            strokeWidth="10"
            className="text-white"
            strokeLinecap="round"
          />
          
          {/* Molecular Nodes */}
          <circle cx="35" cy="35" r="5" className="fill-accent-emerald" />
          <circle cx="65" cy="65" r="5" className="fill-accent-emerald" />
          <circle cx="65" cy="35" r="5" className="fill-accent-emerald" />
          <circle cx="35" cy="65" r="5" className="fill-accent-emerald" />
          <circle cx="50" cy="12" r="4" className="fill-white" />
          <circle cx="50" cy="88" r="4" className="fill-white" />
        </svg>
      </div>

      {!iconOnly && (
        <span className={cn(
          "font-black text-white tracking-tighter uppercase",
          textClasses[size]
        )}>
          CHEM<span className="text-accent-emerald">X</span>GEN
        </span>
      )}
    </div>
  );
};
