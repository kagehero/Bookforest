"use client";

import { motion } from "framer-motion";
import type { Book } from "@/types/book";

interface BookCoverMiniProps {
  book: Book;
  onSelect: (book: Book) => void;
  /** Cover width in px; height derives from the book's trim ratio. */
  width?: number;
}

/**
 * A small face-out cover used on the cabinet's bottom "display ledge" (店主の
 * おすすめ). Mirrors the reference, where a few featured books lean forward with
 * their front cover showing. CSS-only artwork.
 */
export function BookCoverMini({ book, onSelect, width = 64 }: BookCoverMiniProps) {
  const ratio = book.dimensions.heightMm / book.dimensions.widthMm;
  const height = Math.round(width * ratio);

  return (
    <motion.button
      type="button"
      aria-label={`${book.title} — ${book.author}`}
      onClick={() => onSelect(book)}
      /* Leaned back on the platform (面陳列): the cover stands on its bottom
         edge and tips back against the shelf, standing up a little when touched.
         The bottom edge is the pivot, so it genuinely rests on the plank. */
      initial={{ rotateX: 15 }}
      animate={{ rotateX: 15 }}
      whileHover={{ y: -6, rotateX: 4 }}
      whileTap={{ scale: 0.97, rotateX: 4 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="relative shrink-0 select-none rounded-[2px] outline-none focus-visible:ring-2 focus-visible:ring-lantern-glow"
      style={{ width, height, transformStyle: "preserve-3d", transformOrigin: "bottom center" }}
    >
      {/* Grounding shadows. A tight, dark *contact* shadow right where the cover
         meets the wood sells the touch; a softer, wider shadow behind it falls
         the way the lean + overhead light would cast it. */}
      <span
        aria-hidden
        className="absolute -bottom-[2px] left-1/2 -translate-x-1/2 rounded-[50%]"
        style={{
          width: width * 0.78,
          height: 4,
          background: "rgba(0,0,0,0.6)",
          filter: "blur(1.5px)",
        }}
      />
      <span
        aria-hidden
        className="absolute -bottom-[1px] left-1/2 -translate-x-1/2 rounded-[50%]"
        style={{
          width: width * 1.05,
          height: 9,
          background: "rgba(0,0,0,0.32)",
          filter: "blur(5px)",
        }}
      />
      <div
        className="relative h-full w-full overflow-hidden rounded-[2px]"
        style={{
          background: book.cover.background,
          color: book.cover.textColor,
          boxShadow:
            "0 8px 14px -4px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.06)",
        }}
      >
        {/* sheen */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(120deg, rgba(255,255,255,0.22) 0%, transparent 36%)",
          }}
        />
        <div
          className="absolute inset-[3px] rounded-[1px] border"
          style={{ borderColor: "currentColor", opacity: 0.25 }}
        />
        <div className="flex h-full flex-col items-center justify-center px-1.5 text-center">
          <span
            className="vertical-text font-display font-semibold leading-tight"
            style={{ fontSize: width >= 70 ? 11 : 9.5, maxHeight: height - 14, overflow: "hidden" }}
          >
            {book.title}
          </span>
        </div>
      </div>
    </motion.button>
  );
}
