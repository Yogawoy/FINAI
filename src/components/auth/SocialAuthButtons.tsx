'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SocialAuthButtonsProps {
  onSocialAuth?: (provider: 'google' | 'apple') => void;
  className?: string;
  disabled?: boolean;
}

export default function SocialAuthButtons({
  onSocialAuth,
  className = '',
  disabled = false,
}: SocialAuthButtonsProps) {
  const router = useRouter();
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'apple' | null>(null);

  const handleClick = (provider: 'google' | 'apple') => {
    if (disabled || loadingProvider) return;
    setLoadingProvider(provider);
    if (onSocialAuth) {
      onSocialAuth(provider);
    } else {
      setTimeout(() => {
        router.push('/app');
      }, 700);
    }
  };

  return (
    <div className={`grid grid-cols-2 gap-3 w-full ${className}`}>
      {/* Google Button */}
      <button
        type="button"
        disabled={disabled || loadingProvider !== null}
        onClick={() => handleClick('google')}
        className="h-12 rounded-xl bg-white hover:bg-[#F9FAFC] active:bg-[#F2F4FA] border border-[#E4E6EF] text-xs font-bold text-[#242636] transition-all flex items-center justify-center gap-2.5 shadow-2xs hover:shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed select-none"
      >
        {loadingProvider === 'google' ? (
          <svg
            className="animate-spin h-4 w-4 text-[#7C7CE6]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          /* Official Google G Logo SVG */
          <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.97 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
        )}
        <span>Google</span>
      </button>

      {/* Apple Button */}
      <button
        type="button"
        disabled={disabled || loadingProvider !== null}
        onClick={() => handleClick('apple')}
        className="h-12 rounded-xl bg-white hover:bg-[#F9FAFC] active:bg-[#F2F4FA] border border-[#E4E6EF] text-xs font-bold text-[#242636] transition-all flex items-center justify-center gap-2.5 shadow-2xs hover:shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed select-none"
      >
        {loadingProvider === 'apple' ? (
          <svg
            className="animate-spin h-4 w-4 text-[#7C7CE6]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          /* Official Apple Logo SVG */
          <svg className="w-4.5 h-4.5 text-[#242636]" fill="currentColor" viewBox="0 0 170 170">
            <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.7-7.85-12.01-14.43-5.34-8.15-9.68-17.78-13.02-28.89-3.34-11.1-5.01-21.84-5.01-32.22 0-14.88 3.78-27.42 11.33-37.62 7.55-10.2 17.06-15.42 28.53-15.66 4.7 0 10.02 1.25 15.96 3.76 5.94 2.51 9.94 3.82 12.01 3.93 1.86-.11 6.01-1.48 12.45-4.12 6.44-2.63 12.07-3.83 16.9-3.59 13.06.67 23.41 5.34 31.06 14.02-11.39 6.89-16.97 16.5-16.74 28.83.22 9.69 4.02 17.84 11.4 24.45 7.38 6.61 16.03 10.36 25.96 11.24-2.12 6.42-4.58 12.78-7.39 19.08zM119.22 33.56c0-6.73 2.45-13.17 7.35-19.32 4.9-6.15 10.97-10.27 18.2-12.35.79 3.03 1.18 5.73 1.18 8.1 0 6.62-2.63 13.25-7.9 19.89-5.27 6.64-11.53 10.59-18.78 11.85-.05-2.7-.05-5.43-.05-8.17z" />
          </svg>
        )}
        <span>Apple</span>
      </button>
    </div>
  );
}
