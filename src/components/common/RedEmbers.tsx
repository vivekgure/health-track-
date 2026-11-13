"use client";

import React from "react";

export default function RedEmbers({ count = 8, className = "" }: { count?: number; className?: string }) {
  // Use fixed deterministic positions to avoid hydration mismatch
  const embers = [
    { top: "15%", left: "20%", delay: "0s", size: 3 },
    { top: "35%", left: "75%", delay: "1.2s", size: 2 },
    { top: "65%", left: "30%", delay: "2.4s", size: 4 },
    { top: "80%", left: "85%", delay: "0.8s", size: 3 },
    { top: "25%", left: "60%", delay: "3.1s", size: 2.5 },
    { top: "70%", left: "15%", delay: "1.8s", size: 3 },
    { top: "50%", left: "90%", delay: "2.7s", size: 2 },
    { top: "90%", left: "45%", delay: "3.5s", size: 3.5 },
  ].slice(0, count);

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden select-none ${className}`} aria-hidden="true">
      {embers.map((e, idx) => (
        <div
          key={idx}
          className="red-particle animate-ember-float"
          style={{
            top: e.top,
            left: e.left,
            width: `${e.size}px`,
            height: `${e.size}px`,
            animationDelay: e.delay,
            backgroundColor: idx % 2 === 0 ? "#FF2638" : "#B5121B",
          }}
        />
      ))}
    </div>
  );
}

