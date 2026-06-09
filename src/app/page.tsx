"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { ForestScene } from "@/components/ForestScene";
import { ShelfScene } from "@/components/ShelfScene";

type View = "forest" | "shelf";

/**
 * App root — a *smartphone-only* experience.
 *
 * On a real phone the frame fills the whole viewport. On a wider screen the same
 * frame is centred as a fixed-size "phone" mock-up, surrounded by the forest
 * ambience, so the layout never breaks and the experience stays true to mobile.
 *
 * The frame is the positioning context (`relative` + `overflow-hidden`): every
 * full-screen overlay inside the app is `absolute inset-0`, so it is clipped to
 * the phone frame rather than spilling across a desktop viewport.
 */
export default function Home() {
  const [view, setView] = useState<View>("forest");

  return (
    <div className="relative flex min-h-[100dvh] w-full items-center justify-center overflow-hidden bg-forest-deepest">
      {/* Ambient forest backdrop shown around the phone on larger screens. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 hidden sm:block"
        style={{
          background:
            "radial-gradient(80% 60% at 50% 30%, #1d3327 0%, #13201a 45%, #0c1410 100%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed left-1/2 top-1/2 hidden h-[80vh] w-[80vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lantern-glow/10 blur-3xl sm:block"
      />

      {/* The phone frame. Fills the screen on mobile; a centred device on desktop. */}
      <main
        className="
          relative z-10 h-[100dvh] w-full overflow-hidden bg-forest-deepest
          sm:h-[min(900px,94dvh)] sm:max-w-[430px] sm:rounded-[2.5rem]
          sm:border-[10px] sm:border-forest-deep sm:shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)]
        "
      >
        <AnimatePresence mode="wait">
          {view === "forest" ? (
            <motion.div
              key="forest"
              className="h-full w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.04, filter: "blur(4px)" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <ForestScene onEnter={() => setView("shelf")} />
            </motion.div>
          ) : (
            <motion.div
              key="shelf"
              className="h-full w-full"
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <ShelfScene onExit={() => setView("forest")} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
