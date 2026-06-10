"use client";

import { motion } from "framer-motion";
import type { Book } from "@/types/book";
import { DISPLAY_SIZE_SCALE } from "@/types/book";

interface BookSpineProps {
  book: Book;
  onSelect: (book: Book) => void;
  /** Hidden while this book is animating out into the detail overlay. */
  hidden?: boolean;
  /**
   * Overall scale of the spine. The cabinet packs many rows on a phone, so it
   * renders compact spines (~0.62); the default 1 keeps the original size used
   * elsewhere.
   */
  scale?: number;
}

// Map physical mm to on-screen px within a pleasing range for mobile shelves.
function spineWidth(thicknessMm: number, scale: number): number {
  // Keep thickness proportional but clamp to a believable, legible band so no
  // spine is a sliver or a slab. 13mm → ~22px, 24mm → ~42px (before scaling).
  const raw = 16 + (thicknessMm - 13) * 1.9;
  return Math.round(clamp(raw, 18, 44) * scale);
}
function spineHeight(heightMm: number, scale: number): number {
  // Real shelved books are roughly the same height with gentle variation — the
  // earlier 2.1×/mm made tops jagged. Compress the spread so the row tops form a
  // tidy, believable line: 174mm → ~196px, 193mm → ~214px (before scaling),
  // i.e. ≈18px of variation instead of ≈40px.
  return Math.round((196 + (heightMm - 174) * 0.95) * scale);
}
function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

/**
 * A single book rendered as a spine standing on the shelf. CSS-only artwork:
 * a vertical gradient body, an inset highlight/shadow for roundness, an optional
 * printed band, and the vertically-set title + author.
 */
export function BookSpine({ book, onSelect, hidden, scale = 1 }: BookSpineProps) {
  // Display size nudges the spine larger/smaller so the owner's "prominence"
  // choice is visible on the shelf without breaking the packed row layout.
  const sizeScale = DISPLAY_SIZE_SCALE[book.displaySize ?? "medium"];
  const effScale = scale * sizeScale;
  const w = spineWidth(book.dimensions.thicknessMm, effScale);
  const h = spineHeight(book.dimensions.heightMm, effScale);
  const compact = effScale < 0.85;
  const titleSize = compact ? (w >= 26 ? 11 : 9.5) : w >= 38 ? 15 : 13;
  const hasImage = Boolean(book.spineImage);

  return (
    <motion.button
      type="button"
      aria-label={`${book.title} — ${book.author}`}
      onClick={() => onSelect(book)}
      animate={{
        opacity: hidden ? 0 : 1,
        y: hidden ? -8 : 0,
        width: hidden ? 0 : w,
        marginLeft: hidden ? 0 : 1,
        marginRight: hidden ? 0 : 1,
      }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{
        y: -14,
        boxShadow:
          "0 14px 26px -6px rgba(0,0,0,0.6), 0 0 18px rgba(255,207,138,0.45)",
      }}
      whileTap={{ y: -6, scale: 0.985 }}
      className="relative flex shrink-0 select-none items-center justify-center overflow-hidden rounded-[3px] shadow-spine outline-none focus-visible:ring-2 focus-visible:ring-lantern-glow"
      style={{
        width: w,
        height: h,
        background: `linear-gradient(95deg, ${book.spine.color} 0%, ${book.spine.color} 62%, ${book.spine.accent} 100%)`,
      }}
    >
      {/* Owner-supplied spine artwork, cover-fit over the body. */}
      {hasImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={book.spineImage}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
      )}
      {/* page block hint on the right edge */}
      <span
        className="absolute right-0 top-0 h-full w-[3px]"
        style={{
          background:
            "repeating-linear-gradient(180deg, #efe7d2 0 1px, #d8c9a8 1px 2px)",
          opacity: 0.5,
        }}
      />
      {/* head/tail bands */}
      {!hasImage && book.spine.band && (
        <>
          <span
            className="absolute left-0 right-[3px] h-[2px]"
            style={{ top: compact ? 8 : 12, background: book.spine.band, opacity: 0.85 }}
          />
          <span
            className="absolute left-0 right-[3px] h-[2px]"
            style={{ bottom: compact ? 8 : 12, background: book.spine.band, opacity: 0.85 }}
          />
        </>
      )}

      {/* glossy roundness highlight */}
      <span
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,255,255,0.14) 0%, transparent 18%, transparent 78%, rgba(0,0,0,0.32) 100%)",
        }}
      />

      {/* Vertical title + author, optically centered on the visible spine
          face. The 3px page-block edge lives on the right, so we nudge the
          lettering left by half of it to sit dead-center on what's seen.
          Suppressed when owner artwork already carries the lettering. */}
      {!hasImage && (
      <span
        className="vertical-text flex max-h-full items-center justify-center gap-1.5 px-[2px] font-display"
        style={{
          color: book.spine.textColor,
          marginRight: 3,
          paddingTop: compact ? 12 : 24,
          paddingBottom: compact ? 12 : 24,
        }}
      >
        <span
          className="text-center font-semibold leading-tight"
          style={{
            fontSize: titleSize,
            maxHeight: h - (compact ? 28 : 56),
            overflow: "hidden",
          }}
        >
          {book.title}
        </span>
        {!compact && (
          <span className="self-center text-[10px] opacity-75">
            {book.author}
          </span>
        )}
      </span>
      )}
    </motion.button>
  );
}
