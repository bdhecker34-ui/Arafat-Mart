import React from 'react';

export interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  variant?: 'header' | 'footer' | 'compact' | 'icon-only';
  invertText?: boolean;
  className?: string;
  badgeText?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showTagline = true,
  variant = 'header',
  invertText = false,
  className = '',
  badgeText,
}) => {
  // Sizing configurations
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-14 h-14',
  };

  const textSizes = {
    sm: {
      title: 'text-lg',
      tagline: 'text-[9.5px]',
      dot: 'w-1.5 h-1.5',
    },
    md: {
      title: 'text-[22px]',
      tagline: 'text-[10px]',
      dot: 'w-1.5 h-1.5',
    },
    lg: {
      title: 'text-2xl',
      tagline: 'text-[11px]',
      dot: 'w-2 h-2',
    },
    xl: {
      title: 'text-3xl',
      tagline: 'text-xs',
      dot: 'w-2 h-2',
    },
  };

  const currentText = textSizes[size];

  // SVG Icon Component
  const LogoMark = (
    <div className={`relative shrink-0 ${iconSizes[size]} transition-transform duration-300 group-hover:scale-105`}>
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm"
      >
        <defs>
          {/* Saffron-Orange Gradient */}
          <linearGradient id="em-orange-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff7a00" />
            <stop offset="60%" stopColor="#f36805" />
            <stop offset="100%" stopColor="#db5200" />
          </linearGradient>

          {/* Emerald Gradient */}
          <linearGradient id="em-emerald-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          {/* Dark Navy Metallic Base */}
          <linearGradient id="em-navy-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Soft Glow Shadow */}
          <filter id="em-glow" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#f36805" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Squircle Shell */}
        <rect
          x="2"
          y="2"
          width="44"
          height="44"
          rx="12"
          fill="url(#em-navy-grad)"
        />
        <rect
          x="2"
          y="2"
          width="44"
          height="44"
          rx="12"
          stroke="rgba(255, 255, 255, 0.12)"
          strokeWidth="1.2"
        />

        {/* Shopping Bag Body */}
        <path
          d="M12.5 17.5C12.5 16.3954 13.3954 15.5 14.5 15.5H33.5C34.6046 15.5 35.5 16.3954 35.5 17.5L34 35C34 36.6569 32.6569 38 31 38H17C15.3431 38 14 36.6569 14 35L12.5 17.5Z"
          fill="url(#em-orange-grad)"
          filter="url(#em-glow)"
        />

        {/* Modern Bag Handle with White Gloss */}
        <path
          d="M18.5 15.5V12C18.5 8.96243 20.9624 6.5 24 6.5C27.0376 6.5 29.5 8.96243 29.5 12V15.5"
          stroke="#ffffff"
          strokeWidth="2.8"
          strokeLinecap="round"
        />

        {/* Modern Speed / Letter "E" Lines inside Bag */}
        <path
          d="M18 21.5H30"
          stroke="#ffffff"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M18 26H26.5"
          stroke="#ffffff"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeOpacity="0.9"
        />
        <path
          d="M18 30.5H23.5"
          stroke="#ffffff"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeOpacity="0.8"
        />

        {/* Top-Right Emerald Verification Pip */}
        <circle cx="36" cy="11.5" r="3.2" fill="url(#em-emerald-grad)" />
        <circle cx="36" cy="11.5" r="3.2" stroke="#ffffff" strokeWidth="1" />
      </svg>
    </div>
  );

  if (variant === 'icon-only') {
    return <div className={`inline-flex items-center ${className}`}>{LogoMark}</div>;
  }

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {LogoMark}

      <div className="flex flex-col text-left">
        {/* Main Wordmark */}
        <div className="flex items-center gap-1 leading-tight tracking-tight">
          <span
            className={`font-black tracking-tight ${currentText.title} transition-colors ${
              invertText ? 'text-white' : 'text-slate-900 dark:text-white'
            }`}
          >
            Easy
          </span>
          <span
            className={`font-black tracking-tight ${currentText.title} bg-gradient-to-r from-[#f36805] via-[#ff781f] to-[#db5200] bg-clip-text text-transparent`}
          >
            Mart
          </span>
          <span
            className={`${currentText.dot} rounded-full bg-[#f36805] shadow-xs animate-pulse ml-0.5 self-center`}
          />
        </div>

        {/* Tagline & Optional Trust Badge */}
        {showTagline && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className={`font-semibold ${currentText.tagline} leading-none tracking-normal ${
                invertText ? 'text-amber-200/90' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              সবকিছু, এক ঠিকানায়।
            </span>
            {badgeText && (
              <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[8.5px] font-bold bg-emerald-100/90 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/60 leading-none">
                {badgeText}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandLogo;
