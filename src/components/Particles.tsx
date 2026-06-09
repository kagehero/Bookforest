"use client";

import { useEffect, useState } from "react";

interface ParticlesProps {
  count?: number;
  /** Tailwind-ish colour string for the motes. */
  className?: string;
}

interface Mote {
  id: number;
  left: number;
  bottom: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

/**
 * Soft floating dust / pollen motes drifting upward. Pure CSS animation
 * (no per-frame JS) so it's cheap on mobile.
 *
 * Positions are randomised, so they are generated *after mount* only — the
 * server renders an empty container and the client fills it in. This avoids a
 * hydration mismatch (server `Math.random()` ≠ client `Math.random()`).
 */
export function Particles({ count = 28, className = "" }: ParticlesProps) {
  const [motes, setMotes] = useState<Mote[]>([]);

  useEffect(() => {
    setMotes(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        bottom: Math.random() * 60,
        size: 1.5 + Math.random() * 3.5,
        duration: 9 + Math.random() * 10,
        delay: Math.random() * 12,
        opacity: 0.25 + Math.random() * 0.55,
      })),
    );
  }, [count]);

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {motes.map((m) => (
        <span
          key={m.id}
          className="absolute rounded-full bg-lantern-glow animate-drift-slow"
          style={{
            left: `${m.left}%`,
            bottom: `${m.bottom}%`,
            width: m.size,
            height: m.size,
            opacity: m.opacity,
            filter: "blur(0.5px)",
            boxShadow: "0 0 6px rgba(255,207,138,0.7)",
            animationDuration: `${m.duration}s`,
            animationDelay: `${m.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
