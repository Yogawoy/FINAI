import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'periwinkle' | 'lavender' | 'mint' | 'peach' | 'iceblue' | 'neutral' | 'glass';
  size?: 'sm' | 'md';
  className?: string;
  icon?: React.ReactNode;
}

export default function Badge({
  children,
  variant = 'lavender',
  size = 'md',
  className = '',
  icon,
}: BadgeProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'periwinkle':
        return 'bg-[#7C7CE6]/15 text-[#6362D8] border border-[#7C7CE6]/25';
      case 'lavender':
        return 'bg-[#E4E2FB] text-[#6362D8] border border-[#6362D8]/15';
      case 'mint':
        return 'bg-[#D0EFE5] text-[#1B7354] border border-[#1B7354]/15';
      case 'peach':
        return 'bg-[#FCE2E0] text-[#B83A38] border border-[#B83A38]/15';
      case 'iceblue':
        return 'bg-[#D6E4FA] text-[#3E6FB0] border border-[#3E6FB0]/15';
      case 'glass':
        return 'bg-white/65 backdrop-blur-md text-[#30334A] border border-white/80 shadow-xs';
      default:
        return 'bg-black/[0.04] text-[#757A95] border border-black/[0.05]';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-0.5 text-[11px] gap-1 rounded-lg';
      default:
        return 'px-2.5 py-1 text-xs gap-1.5 rounded-xl';
    }
  };

  return (
    <span
      className={`inline-flex items-center font-medium tracking-tight whitespace-nowrap transition-colors ${getVariantStyles()} ${getSizeStyles()} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
}
