"use client";

import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { useState } from "react";
import type { Book, SamplePage } from "@/types/book";

interface ReadingViewProps {
  book: Book | null;
  onClose: () => void;
}

const SWIPE_THRESHOLD = 60;

/**
 * Step ④ 試し読み — the sample opens as a realistic **two-page spread**, exactly
 * like the storyboard: a left and right page joined at a central binding gutter,
 * on warm grained paper with comfortable mincho typography. Swipe or tap the
 * edges to turn to the next spread (two pages at a time); the outgoing spread
 * flips about the spine.
 */
export function ReadingView({ book, onClose }: ReadingViewProps) {
  // `spread` indexes pairs of pages: spread 0 = pages[0..1], spread 1 = [2..3]…
  const [spread, setSpread] = useState(0);
  const [direction, setDirection] = useState(1);

  if (!book) return null;
  const pages = book.sample;
  const spreadCount = Math.ceil(pages.length / 2);
  const left = pages[spread * 2];
  const right = pages[spread * 2 + 1];

  const turn = (dir: number) => {
    const next = spread + dir;
    if (next < 0 || next >= spreadCount) return;
    setDirection(dir);
    setSpread(next);
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -SWIPE_THRESHOLD) turn(1);
    else if (info.offset.x > SWIPE_THRESHOLD) turn(-1);
  };

  const spreadVariants = {
    enter: (d: number) => ({
      rotateY: d > 0 ? 38 : -38,
      opacity: 0,
      transformOrigin: "center center",
    }),
    center: { rotateY: 0, opacity: 1, transformOrigin: "center center" },
    exit: (d: number) => ({
      rotateY: d > 0 ? -38 : 38,
      opacity: 0,
      transformOrigin: "center center",
    }),
  };

  return (
    <motion.div
      className="absolute inset-0 z-[60] flex flex-col bg-forest-deepest"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* top bar */}
      <div className="flex items-center justify-between px-5 py-4">
        <button
          onClick={onClose}
          className="text-sm tracking-wider text-parchment/80"
        >
          ✕ とじる
        </button>
        <span className="font-display text-sm text-parchment/90">
          {book.title}
        </span>
        <span className="w-16 text-right text-xs text-sage/70">
          {spread + 1}/{spreadCount}
        </span>
      </div>

      {/* book stage */}
      <div
        className="relative flex flex-1 items-center justify-center px-3 pb-5"
        style={{ perspective: 2000 }}
      >
        {/* tap zones */}
        <button
          aria-label="前のページ"
          onClick={() => turn(-1)}
          className="absolute left-0 top-0 z-20 h-full w-1/5"
        />
        <button
          aria-label="次のページ"
          onClick={() => turn(1)}
          className="absolute right-0 top-0 z-20 h-full w-1/5"
        />

        <div className="relative h-full max-h-[600px] w-full max-w-md">
          <AnimatePresence custom={direction} mode="popLayout">
            <motion.div
              key={spread}
              custom={direction}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={onDragEnd}
              variants={spreadVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 flex cursor-grab touch-pan-y overflow-hidden rounded-md active:cursor-grabbing"
              style={{
                boxShadow: "0 26px 55px rgba(0,0,0,0.65)",
                transformStyle: "preserve-3d",
              }}
            >
              <Page page={left} side="left" />
              {/* central binding gutter */}
              <div
                aria-hidden
                className="z-10 w-[10px] shrink-0"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(0,0,0,0.28) 0%, rgba(120,90,50,0.12) 45%, rgba(0,0,0,0.28) 100%)",
                }}
              />
              <Page page={right} side="right" />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <p className="pb-6 text-center text-[11px] tracking-widest text-sage/50">
        左右にスワイプしてページをめくる
      </p>
    </motion.div>
  );
}

/** One physical page within the open spread. */
function Page({ page, side }: { page?: SamplePage; side: "left" | "right" }) {
  const gutterShadow =
    side === "left"
      ? "inset -14px 0 24px -12px rgba(120,90,50,0.5)"
      : "inset 14px 0 24px -12px rgba(120,90,50,0.5)";

  return (
    <div
      className="paper-grain relative flex-1 overflow-hidden"
      style={{
        background: "linear-gradient(105deg,#f3ead4 0%,#ede3cf 18%,#e8ddc4 100%)",
        color: "#3a3026",
        boxShadow: gutterShadow,
      }}
    >
      {page ? (
        <div className="flex h-full flex-col px-6 py-8">
          {page.heading && (
            <h4 className="mb-4 font-display text-base font-bold tracking-wide">
              {page.heading}
            </h4>
          )}
          <div className="flex-1 space-y-3 overflow-y-auto font-serif text-[13.5px] leading-[1.95] tracking-wide">
            {page.paragraphs.map((p, i) => (
              <p key={i} className="indent-4">
                {p}
              </p>
            ))}
          </div>
          <div className="mt-3 text-center font-display text-xs text-parchment-ink/50">
            — {page.pageNumber} —
          </div>
        </div>
      ) : (
        // Blank end-paper when the sample has an odd number of pages.
        <div className="flex h-full items-center justify-center">
          <span className="font-display text-xs tracking-widest text-parchment-ink/30">
            — 試し読みはここまで —
          </span>
        </div>
      )}
    </div>
  );
}
