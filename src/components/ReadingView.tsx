"use client";

import {
  AnimatePresence,
  motion,
  animate,
  useMotionValue,
  useTransform,
  type MotionValue,
  type PanInfo,
} from "framer-motion";
import { useRef, useState } from "react";
import type { Book, SamplePage } from "@/types/book";

interface ReadingViewProps {
  book: Book | null;
  onClose: () => void;
}

const SWIPE_THRESHOLD = 60;
const FLIP_MS = 820;
// The turning leaf is sliced into vertical strips; each rotates a little more
// than the one before, so the sheet curls and peels like real paper instead of
// staying a rigid flat plane.
const STRIPS = 12;

/**
 * Step ④ 試し読み — the sample opens as a realistic **two-page spread** on warm
 * grained paper with mincho typography. Turning a page mimics a real book: the
 * leaf lifts off the spine and *curls* as it swings across the binding — sliced
 * into strips that fan progressively, with a corner lift and a shadow sweeping
 * over the curve — revealing the next page underneath. Swipe, tap the edges, or
 * use the arrow tap-zones to turn.
 */
export function ReadingView({ book, onClose }: ReadingViewProps) {
  // `spread` indexes pairs of pages: spread 0 = pages[0..1], spread 1 = [2..3]…
  const [spread, setSpread] = useState(0);
  // The leaf currently mid-flip, or null when the book is at rest.
  const [flip, setFlip] = useState<{ dir: number; from: number } | null>(null);
  // 0 = leaf flat on its starting side, 1 = fully turned to the other side.
  const progress = useMotionValue(0);
  const busy = useRef(false);

  if (!book) return null;
  const pages = book.sample;
  const spreadCount = Math.ceil(pages.length / 2);

  const pageAt = (i: number) => pages[i];
  const spreadLeft = (s: number) => pageAt(s * 2);
  const spreadRight = (s: number) => pageAt(s * 2 + 1);

  const turn = async (dir: number) => {
    if (busy.current) return;
    const next = spread + dir;
    if (next < 0 || next >= spreadCount) return;
    busy.current = true;

    setFlip({ dir, from: spread });
    progress.set(0);
    await animate(progress, 1, {
      duration: FLIP_MS / 1000,
      ease: [0.36, 0, 0.22, 1],
    });

    setSpread(next);
    setFlip(null);
    busy.current = false;
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -SWIPE_THRESHOLD) void turn(1);
    else if (info.offset.x > SWIPE_THRESHOLD) void turn(-1);
  };

  // During a forward flip the static right half shows the *next* spread's right
  // page peeking out from under the turning leaf; backward is the mirror.
  const fwd = flip?.dir === 1;
  const bwd = flip?.dir === -1;

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
        style={{ perspective: 1900 }}
      >
        {/* tap zones */}
        <button
          aria-label="前のページ"
          onClick={() => void turn(-1)}
          className="absolute left-0 top-0 z-30 h-full w-1/5"
        />
        <button
          aria-label="次のページ"
          onClick={() => void turn(1)}
          className="absolute right-0 top-0 z-30 h-full w-1/5"
        />

        <motion.div
          className="relative h-full max-h-[600px] w-full max-w-md cursor-grab touch-pan-y active:cursor-grabbing"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.18}
          onDragEnd={onDragEnd}
          style={{
            transformStyle: "preserve-3d",
            boxShadow: "0 26px 55px rgba(0,0,0,0.65)",
          }}
        >
          {/* Static base spread. The half being uncovered already shows the
              destination page beneath the lifting leaf. */}
          <div className="flex h-full overflow-hidden rounded-md">
            <div className="h-full flex-1">
              <Page
                page={bwd ? spreadLeft(flip.from - 1) : spreadLeft(spread)}
                side="left"
              />
            </div>
            <Gutter />
            <div className="h-full flex-1">
              <Page
                page={fwd ? spreadRight(flip.from + 1) : spreadRight(spread)}
                side="right"
              />
            </div>
          </div>

          {/* The curling leaf, built from vertical strips. */}
          <AnimatePresence>
            {flip && (
              <CurlingLeaf
                key={`${flip.from}-${flip.dir}`}
                progress={progress}
                dir={flip.dir}
                frontPage={fwd ? spreadRight(flip.from) : spreadLeft(flip.from)}
                backPage={
                  fwd ? spreadLeft(flip.from + 1) : spreadRight(flip.from - 1)
                }
              />
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <p className="pb-6 text-center text-[11px] tracking-widest text-sage/50">
        左右にスワイプしてページをめくる
      </p>
    </motion.div>
  );
}

/**
 * A single leaf mid-turn, sliced into vertical strips. Strip 0 sits at the
 * spine (the hinge) and barely moves; the outer strips swing further, so the
 * sheet bows into a curl and the free corner lifts away from the page.
 */
function CurlingLeaf({
  progress,
  dir,
  frontPage,
  backPage,
}: {
  progress: MotionValue<number>;
  dir: number;
  frontPage?: SamplePage;
  backPage?: SamplePage;
}) {
  const fwd = dir > 0;
  // The whole leaf occupies one half of the spread (minus the gutter).
  const containerStyle: React.CSSProperties = {
    width: "calc(50% - 5px)",
    left: fwd ? "calc(50% + 5px)" : 0,
    transformStyle: "preserve-3d",
  };

  return (
    <motion.div className="absolute top-0 z-20 h-full" style={containerStyle}>
      {Array.from({ length: STRIPS }).map((_, i) => (
        <LeafStrip
          key={i}
          index={i}
          progress={progress}
          fwd={fwd}
          frontPage={frontPage}
          backPage={backPage}
        />
      ))}
    </motion.div>
  );
}

function LeafStrip({
  index,
  progress,
  fwd,
  frontPage,
  backPage,
}: {
  index: number;
  progress: MotionValue<number>;
  fwd: boolean;
  frontPage?: SamplePage;
  backPage?: SamplePage;
}) {
  // Strips are ordered spine → free edge. Strip 0 hinges on the spine; each
  // later strip hinges on the previous strip's far edge.
  const stripFrac = index / STRIPS; // 0 at spine, →1 at free edge
  const widthPct = 100 / STRIPS;

  // Total turn is 180°. Inner strips reach it sooner; outer strips lag and
  // overshoot, which is what reads as the page curling and the corner lifting.
  const base = fwd ? -180 : 180;
  // Each strip turns a fraction of the total, scaled so outer strips fan more.
  const fan = 1 + stripFrac * 0.9;
  const rotate = useTransform(progress, (p) => {
    // Strips peel in sequence: outer ones start a touch later (the corner
    // lifts first), giving the diagonal peel.
    const delay = stripFrac * 0.22;
    const local = clamp((p - delay) / (1 - delay), 0, 1);
    // Ease the local progress so mid-turn the strip bows past its neighbour.
    const eased = local + Math.sin(local * Math.PI) * 0.12 * stripFrac;
    return base * Math.min(eased, 1) * (fan / (1 + 0.9));
  });

  // A shadow that deepens toward the curl and sweeps as the leaf rotates.
  const shade = useTransform(progress, (p) => {
    const here = clamp(p * 1.4 - stripFrac * 0.3, 0, 1);
    return Math.sin(here * Math.PI) * (0.18 + stripFrac * 0.22);
  });
  const shadeBg = useTransform(
    shade,
    (s) => `rgba(40,28,12,${s.toFixed(3)})`,
  );

  // Position: strips are laid left→right for the forward (right) leaf, and the
  // hinge order is mirrored for the backward (left) leaf.
  const leftPct = fwd ? stripFrac * 100 : (1 - stripFrac - 1 / STRIPS) * 100;
  const origin = fwd ? "left center" : "right center";

  return (
    <motion.div
      className="absolute top-0 h-full"
      style={{
        width: `${widthPct}%`,
        left: `${leftPct}%`,
        transformOrigin: origin,
        transformStyle: "preserve-3d",
        rotateY: rotate,
        // Slight z-lift so the curling strips don't z-fight the flat page.
        zIndex: STRIPS - index,
      }}
    >
      {/* Front face — sliced view of the starting page. */}
      <StripFace
        page={frontPage}
        side={fwd ? "right" : "left"}
        face="front"
        stripFrac={stripFrac}
        strips={STRIPS}
      />
      {/* Back face — pre-flipped so it reads correctly past vertical. */}
      <StripFace
        page={backPage}
        side={fwd ? "left" : "right"}
        face="back"
        stripFrac={stripFrac}
        strips={STRIPS}
      />
      {/* Curl shading over this strip. */}
      <motion.div
        aria-hidden
        className="absolute inset-0"
        style={{ background: shadeBg, backfaceVisibility: "hidden" }}
      />
    </motion.div>
  );
}

/**
 * One strip's slice of a page face. We render the *whole* page inside the strip
 * and shift it left by the strip's offset, so the text lines up seamlessly
 * across all strips (each strip is a window onto the same page).
 */
function StripFace({
  page,
  side,
  face,
  stripFrac,
  strips,
}: {
  page?: SamplePage;
  side: "left" | "right";
  face: "front" | "back";
  stripFrac: number;
  strips: number;
}) {
  // For the back face the page is mirrored, so its window scans from the far
  // edge inward.
  const windowFrac = face === "back" ? 1 - stripFrac - 1 / strips : stripFrac;
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        backfaceVisibility: "hidden",
        transform: face === "back" ? "rotateY(180deg)" : undefined,
      }}
    >
      <div
        className="absolute top-0 h-full"
        style={{
          width: `${strips * 100}%`,
          left: `${-windowFrac * strips * 100}%`,
        }}
      >
        <Page page={page} side={side} />
      </div>
    </div>
  );
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

/** Central binding gutter between the two resting pages. */
function Gutter() {
  return (
    <div
      aria-hidden
      className="z-10 w-[10px] shrink-0"
      style={{
        background:
          "linear-gradient(90deg, rgba(0,0,0,0.28) 0%, rgba(120,90,50,0.12) 45%, rgba(0,0,0,0.28) 100%)",
      }}
    />
  );
}

/** One physical page surface. */
function Page({ page, side }: { page?: SamplePage; side: "left" | "right" }) {
  const gutterShadow =
    side === "left"
      ? "inset -14px 0 24px -12px rgba(120,90,50,0.5)"
      : "inset 14px 0 24px -12px rgba(120,90,50,0.5)";

  return (
    <div
      className="paper-grain relative h-full w-full overflow-hidden"
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
          <div className="flex-1 space-y-3 overflow-hidden font-serif text-[13.5px] leading-[1.95] tracking-wide">
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
