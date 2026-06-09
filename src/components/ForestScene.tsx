"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";
import { Particles } from "./Particles";

interface ForestSceneProps {
  onEnter: () => void;
}

/**
 * Full-screen landing scene: a misty forest with a glowing cottage, layered
 * trees and drifting motes. Layers parallax against pointer / device tilt for
 * a gentle sense of depth. Built entirely from CSS gradients — no image assets.
 */
export function ForestScene({ onEnter }: ForestSceneProps) {
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 60, damping: 18 });
  const sy = useSpring(py, { stiffness: 60, damping: 18 });

  // The photo pans gently against pointer / device tilt for a sense of depth.
  const midX = useTransform(sx, (v) => v * 14);
  const midY = useTransform(sy, (v) => v * 9);
  const glowScale = useTransform(sy, [-1, 1], [1.05, 0.95]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      px.set(nx);
      py.set(ny);
    };
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      px.set(Math.max(-1, Math.min(1, e.gamma / 30)));
      py.set(Math.max(-1, Math.min(1, (e.beta - 45) / 30)));
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("deviceorientation", onTilt);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("deviceorientation", onTilt);
    };
  }, [px, py]);

  return (
    <section className="relative h-full w-full overflow-hidden bg-forest-deepest">
      {/* The scene is a single illustrated photograph: a misty forest with an
          ivy-covered bookshop cottage, floating books and lanterns. Painted as a
          CSS background (not next/image) so it loads as a plain static asset —
          no image-optimizer endpoint that ad-blocker extensions can choke on.
          It sits slightly oversized so the gentle parallax can pan it without
          ever revealing an edge. */}
      <motion.div
        role="img"
        aria-label="霧深い森のなかに佇む、蔦に覆われた本屋の小屋"
        style={{
          x: midX,
          y: midY,
          backgroundImage: "url('/forest-cottage.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
        className="absolute -inset-6"
      />

      {/* Warm flicker over the cottage windows, keyed to the lit doorway in the
          photo so the lantern light feels alive. */}
      <motion.div
        style={{ scale: glowScale }}
        className="pointer-events-none absolute left-[58%] top-[52%] -translate-x-1/2 -translate-y-1/2"
      >
        <div className="h-40 w-40 rounded-full bg-lantern-glow/25 blur-3xl animate-flicker" />
      </motion.div>

      <Particles count={30} />

      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 100% at 50% 40%, transparent 40%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      {/* Text scrims — darken just the top (title) and bottom (tagline + CTA)
          so the lettering stays legible while the photo's center stays vivid. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-2/5"
        style={{
          background:
            "linear-gradient(to bottom, rgba(6,12,9,0.7) 0%, rgba(6,12,9,0.2) 50%, transparent 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5"
        style={{
          background:
            "linear-gradient(to top, rgba(6,12,9,0.82) 0%, rgba(6,12,9,0.3) 55%, transparent 100%)",
        }}
      />

      {/* Title + CTA */}
      <div className="absolute inset-x-0 bottom-0 top-0 flex flex-col items-center justify-end px-6 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-auto mt-[18vh]"
        >
          <h1 className="font-display text-5xl font-bold tracking-[0.12em] text-parchment drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
            本の森
          </h1>
          <p className="mt-3 text-xs font-bold tracking-[0.5em] text-lantern drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)]">
            HON NO MORI
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-sm"
        >
          <p className="mb-8 font-serif text-base leading-relaxed text-parchment/85 drop-shadow-[0_1px_8px_rgba(0,0,0,0.9)]">
            霧深い森のおくで、
            <br />
            まだ見ぬ本に出会いませんか。
          </p>

          <motion.button
            onClick={onEnter}
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.03 }}
            className="group inline-flex items-center gap-3 rounded-full border border-lantern-glow/40 bg-forest-deep/60 px-8 py-4 backdrop-blur-sm transition-colors hover:bg-forest-mid/70"
          >
            <span className="font-serif text-sm tracking-[0.2em] text-parchment">
              本棚をのぞく
            </span>
            <span className="text-lantern-glow transition-transform group-hover:translate-x-1">
              →
            </span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
