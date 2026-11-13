"use client";

import React from "react";

export default function WebSpinner({ size = 48, className = "" }: { size?: number; className?: string }) {
  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    >
      <svg
        className="w-full h-full animate-web-spin-slow text-[#FF2638]"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Radial Spokes (8 axes) */}
        <line x1="50" y1="50" x2="50" y2="5" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.8" />
        <line x1="50" y1="50" x2="82" y2="18" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.8" />
        <line x1="50" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.8" />
        <line x1="50" y1="50" x2="82" y2="82" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.8" />
        <line x1="50" y1="50" x2="50" y2="95" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.8" />
        <line x1="50" y1="50" x2="18" y2="82" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.8" />
        <line x1="50" y1="50" x2="5" y2="50" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.8" />
        <line x1="50" y1="50" x2="18" y2="18" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.8" />

        {/* Concentric Octagonal Web Rings */}
        {/* Ring 1 - inner */}
        <polygon
          points="50,38 58,42 62,50 58,58 50,62 42,58 38,50 42,42"
          stroke="currentColor"
          strokeWidth="1"
          strokeOpacity="0.5"
          fill="none"
        />
        {/* Ring 2 - middle */}
        <polygon
          points="50,26 67,33 74,50 67,67 50,74 33,67 26,50 33,33"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeOpacity="0.65"
          fill="none"
        />
        {/* Ring 3 - outer */}
        <polygon
          points="50,14 75,25 86,50 75,75 50,86 25,75 14,50 25,25"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeOpacity="0.85"
          fill="none"
          strokeDasharray="4 2"
        />

        {/* Center glowing node */}
        <circle cx="50" cy="50" r="3.5" fill="#FF2638" filter="drop-shadow(0 0 6px #FF2638)" />
      </svg>
    </div>
  );
}

