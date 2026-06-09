"use client";

import { motion } from "framer-motion";
import type { Book } from "@/types/book";

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
  // 14mm → ~26px, 24mm → ~46px (before scaling)
  return Math.round((18 + (thicknessMm - 14) * 2) * scale);
}
function spineHeight(heightMm: number, scale: number): number {
  // 176mm → ~208px, 193mm → ~244px (before scaling)
  return Math.round((150 + (heightMm - 176) * 2.1) * scale);
}

/**
 * A single book rendered as a spine standing on the shelf. CSS-only artwork:
 * a vertical gradient body, an inset highlight/shadow for roundness, an optional
 * printed band, and the vertically-set title + author.
 */
export function BookSpine({ book, onSelect, hidden, scale = 1 }: BookSpineProps) {
  const w = spineWidth(book.dimensions.thicknessMm, scale);
  const h = spineHeight(book.dimensions.heightMm, scale);
  const compact = scale < 0.85;
  const titleSize = compact ? (w >= 26 ? 11 : 9.5) : w >= 38 ? 15 : 13;

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
      className="relative flex shrink-0 select-none items-end overflow-hidden rounded-[3px] shadow-spine outline-none focus-visible:ring-2 focus-visible:ring-lantern-glow"
      style={{
        width: w,
        height: h,
        background: `linear-gradient(95deg, ${book.spine.color} 0%, ${book.spine.color} 62%, ${book.spine.accent} 100%)`,
      }}
    >
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
      {book.spine.band && (
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

      {/* Vertical title + author */}
      <span
        className="vertical-text mx-auto flex max-h-full items-start gap-1.5 px-[2px] font-display"
        style={{
          color: book.spine.textColor,
          marginTop: compact ? 14 : 28,
          marginBottom: compact ? 12 : 24,
        }}
      >
        <span
          className="font-semibold leading-tight"
          style={{
            fontSize: titleSize,
            maxHeight: h - (compact ? 34 : 64),
            overflow: "hidden",
          }}
        >
          {book.title}
        </span>
        {!compact && (
          <span className="self-end pb-1 text-[10px] opacity-75">
            {book.author}
          </span>
        )}
      </span>
    </motion.button>
  );
}
