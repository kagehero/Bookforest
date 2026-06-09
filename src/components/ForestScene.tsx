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

  // Each layer translates by a different factor → parallax.
  const farX = useTransform(sx, (v) => v * 6);
  const farY = useTransform(sy, (v) => v * 4);
  const midX = useTransform(sx, (v) => v * 14);
  const midY = useTransform(sy, (v) => v * 9);
  const nearX = useTransform(sx, (v) => v * 26);
  const nearY = useTransform(sy, (v) => v * 16);
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
      {/* Far layer — deep canopy haze */}
      <motion.div
        style={{ x: farX, y: farY }}
        className="absolute -inset-12"
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 80% at 50% 10%, #1d3327 0%, #13201a 45%, #0c1410 100%)",
          }}
        />
        {/* distant tree silhouettes */}
        <div
          className="absolute inset-x-0 bottom-0 h-2/3 opacity-70"
          style={{
            background:
              "repeating-linear-gradient(90deg, transparent 0 22px, rgba(8,16,12,0.55) 22px 30px, transparent 30px 60px)",
            maskImage:
              "linear-gradient(to top, black 30%, transparent 90%)",
            WebkitMaskImage:
              "linear-gradient(to top, black 30%, transparent 90%)",
          }}
        />
      </motion.div>

      {/* Lantern glow behind cottage */}
      <motion.div
        style={{ scale: glowScale }}
        className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2"
      >
        <div className="h-72 w-72 rounded-full bg-lantern-glow/40 blur-3xl animate-flicker" />
      </motion.div>

      {/* Mid layer — the cottage */}
      <motion.div
        style={{ x: midX, y: midY }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <div className="relative h-40 w-44">
          {/* roof */}
          <div
            className="absolute left-1/2 top-0 -translate-x-1/2"
            style={{
              width: 0,
              height: 0,
              borderLeft: "92px solid transparent",
              borderRight: "92px solid transparent",
              borderBottom: "54px solid #2a1c12",
            }}
          />
          {/* body */}
          <div className="absolute bottom-0 left-1/2 h-24 w-32 -translate-x-1/2 rounded-sm bg-wood-dark shadow-2xl" />
          {/* glowing window */}
          <div className="absolute bottom-7 left-1/2 h-10 w-9 -translate-x-1/2 rounded-sm bg-lantern-warm shadow-lantern animate-flicker" />
          {/* door */}
          <div className="absolute bottom-0 left-1/2 h-8 w-5 -translate-x-[160%] rounded-t-md bg-lantern-amber/80" />
        </div>
      </motion.div>

      {/* Near layer — foreground foliage frame */}
      <motion.div
        style={{ x: nearX, y: nearY }}
        className="pointer-events-none absolute -inset-8"
      >
        <div
          className="absolute inset-x-0 bottom-0 h-1/3"
          style={{
            background:
              "linear-gradient(to top, #0c1410 10%, rgba(12,20,16,0.6) 60%, transparent 100%)",
          }}
        />
        <div
          className="absolute -left-6 top-0 h-full w-1/3 opacity-90"
          style={{
            background:
              "radial-gradient(60% 80% at 0% 30%, rgba(15,30,22,0.9), transparent 70%)",
          }}
        />
        <div
          className="absolute -right-6 top-0 h-full w-1/3 opacity-90"
          style={{
            background:
              "radial-gradient(60% 80% at 100% 30%, rgba(15,30,22,0.9), transparent 70%)",
          }}
        />
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
          <p className="mt-3 text-xs font-medium tracking-[0.5em] text-lantern-glow/90">
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
