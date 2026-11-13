"use client";

import React from "react";

interface SpiderWebCornerProps {
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "both";
  className?: string;
  opacity?: number;
}

export default function SpiderWebCorner({
  position = "both",
  className = "",
  opacity = 0.28,
}: SpiderWebCornerProps) {
  return (
    <div
      className={`pointer-events-none fixed inset-0 overflow-hidden z-0 select-none ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      {/* Top-Right Web Pattern */}
      {(position === "top-right" || position === "both") && (
        <svg
          className="absolute -top-6 -right-6 w-72 h-72 sm:w-96 sm:h-96 text-[#FF2638] animate-web-pulse"
          viewBox="0 0 300 300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main Radial Spokes emanating from top-right corner (300, 0) */}
          <line x1="300" y1="0" x2="0" y2="0" stroke="currentColor" strokeWidth="1" strokeOpacity="0.6" className="web-line" />
          <line x1="300" y1="0" x2="30" y2="80" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" className="web-line" />
          <line x1="300" y1="0" x2="70" y2="160" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" className="web-line" />
          <line x1="300" y1="0" x2="130" y2="230" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" className="web-line" />
          <line x1="300" y1="0" x2="210" y2="280" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" className="web-line" />
          <line x1="300" y1="0" x2="300" y2="300" stroke="currentColor" strokeWidth="1" strokeOpacity="0.6" className="web-line" />

          {/* Concentric Web Arcs / Thread Strands */}
          <path d="M 270 0 Q 260 20 280 40 L 300 40" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" fill="none" />
          <path d="M 235 0 Q 215 45 250 85 L 300 90" stroke="currentColor" strokeWidth="1" strokeOpacity="0.45" fill="none" />
          <path d="M 190 0 Q 160 80 215 140 L 300 150" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" fill="none" />
          <path d="M 140 0 Q 95 125 170 200 L 300 215" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.5" fill="none" />
          <path d="M 80 0 Q 25 180 120 260 L 300 285" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.4" fill="none" />

          {/* Secondary Delicate Cross Weaves */}
          <path d="M 255 15 L 265 30 L 290 20" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.3" fill="none" />
          <path d="M 210 30 L 230 65 L 275 60" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.3" fill="none" />
          <path d="M 160 50 L 190 110 L 255 115" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.3" fill="none" />

          {/* Center Glow Node */}
          <circle cx="300" cy="0" r="4" fill="#FF2638" filter="drop-shadow(0 0 8px #FF2638)" />
        </svg>
      )}

      {/* Bottom-Left Web Pattern */}
      {(position === "bottom-left" || position === "both") && (
        <svg
          className="absolute -bottom-6 -left-6 w-72 h-72 sm:w-96 sm:h-96 text-[#B5121B] animate-web-pulse"
          style={{ animationDelay: "2.5s" }}
          viewBox="0 0 300 300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main Radial Spokes from bottom-left corner (0, 300) */}
          <line x1="0" y1="300" x2="300" y2="300" stroke="currentColor" strokeWidth="1" strokeOpacity="0.6" className="web-line" />
          <line x1="0" y1="300" x2="270" y2="220" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" className="web-line" />
          <line x1="0" y1="300" x2="230" y2="140" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" className="web-line" />
          <line x1="0" y1="300" x2="170" y2="70" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" className="web-line" />
          <line x1="0" y1="300" x2="90" y2="20" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" className="web-line" />
          <line x1="0" y1="300" x2="0" y2="0" stroke="currentColor" strokeWidth="1" strokeOpacity="0.6" className="web-line" />

          {/* Concentric Web Arcs / Strands */}
          <path d="M 30 300 Q 40 280 20 260 L 0 260" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" fill="none" />
          <path d="M 65 300 Q 85 255 50 215 L 0 210" stroke="currentColor" strokeWidth="1" strokeOpacity="0.45" fill="none" />
          <path d="M 110 300 Q 140 220 85 160 L 0 150" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" fill="none" />
          <path d="M 160 300 Q 205 175 130 100 L 0 85" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.5" fill="none" />
          <path d="M 220 300 Q 275 120 180 40 L 0 15" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.4" fill="none" />

          {/* Center Glow Node */}
          <circle cx="0" cy="300" r="4" fill="#B5121B" filter="drop-shadow(0 0 8px #FF2638)" />
        </svg>
      )}

      {/* Subtle Ambient Red Glows in background */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#B5121B]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-[#FF2638]/4 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}

