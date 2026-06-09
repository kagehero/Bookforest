"use client";

import { useMemo } from "react";
import type { Book } from "@/types/book";
import { BookSpine } from "./BookSpine";
import { BookCoverMini } from "./BookCoverMini";

interface BookshelfProps {
  /** Cabinet sign label (e.g. おすすめの本棚 / 季節の本棚). */
  title: string;
  /** Sub-label under the sign. */
  subtitle: string;
  /** All books to arrange in this single cabinet, in display order. */
  books: Book[];
  onSelect: (book: Book) => void;
  /** id of a book that is currently animating into the overlay (hidden on shelf). */
  pulledBookId?: string | null;
}

/** Compact scale so several rows of spines fit inside one cabinet on a phone. */
const SPINE_SCALE = 0.62;
/** Approximate inner width (px) of a row before it wraps. Tuned for the phone frame. */
const ROW_WIDTH = 320;
/** Estimated on-screen spine width (incl. margins) for a given thickness. */
function estSpineWidth(thicknessMm: number): number {
  return Math.round((18 + (thicknessMm - 14) * 2) * SPINE_SCALE) + 2;
}

/**
 * One wooden **cabinet** (a piece of furniture), matching the reference: a thick
 * timber frame around several rows of tightly-packed spines, each row standing
 * on its own plank, with a face-out "店主のおすすめ" display ledge at the bottom.
 *
 * Books are distributed across the rows in order; featured titles are surfaced
 * on the display ledge. Each spine keeps its real proportions (just scaled down)
 * so the packing still looks hand-arranged.
 */
export function Bookshelf({ title, subtitle, books, onSelect, pulledBookId }: BookshelfProps) {
  const { rows, featured } = useMemo(() => {
    // The bottom display ledge holds face-out covers — featured titles first,
    // topped up with a few others so the platform always looks stocked.
    const MAX_FEATURED = 5;
    const flagged = books.filter((b) => b.featured);
    const rest = books.filter((b) => !b.featured);
    const feat = [...flagged, ...rest].slice(
      0,
      Math.min(MAX_FEATURED, Math.max(0, books.length - 4)),
    );
    const featIds = new Set(feat.map((b) => b.id));
    const spineBooks = books.filter((b) => !featIds.has(b.id));

    // Flow-pack spines left-to-right, wrapping when a row fills the cabinet
    // width — so rows stay densely packed like the reference rather than sparse.
    const grouped: Book[][] = [];
    let current: Book[] = [];
    let used = 0;
    for (const book of spineBooks) {
      const w = estSpineWidth(book.dimensions.thicknessMm);
      if (used + w > ROW_WIDTH && current.length > 0) {
        grouped.push(current);
        current = [];
        used = 0;
      }
      current.push(book);
      used += w;
    }
    if (current.length > 0) grouped.push(current);

    return { rows: grouped, featured: feat };
  }, [books]);

  if (books.length === 0) {
    return (
      <div className="px-5">
        <CabinetFrame title={title} subtitle={subtitle}>
          <p className="py-16 text-center text-sm text-sage/60">
            この本棚にはまだ本がありません。
          </p>
        </CabinetFrame>
      </div>
    );
  }

  return (
    <div className="px-4">
      <CabinetFrame title={title} subtitle={subtitle}>
        {/* Spine rows */}
        {rows.map((row, ri) => (
          <ShelfRow key={ri}>
            {row.map((book) => (
              <BookSpine
                key={book.id}
                book={book}
                onSelect={onSelect}
                hidden={pulledBookId === book.id}
                scale={SPINE_SCALE}
              />
            ))}
          </ShelfRow>
        ))}

        {/* Featured face-out display ledge */}
        {featured.length > 0 && (
          <DisplayLedge>
            {featured.map((book) => (
              <BookCoverMini key={book.id} book={book} onSelect={onSelect} />
            ))}
          </DisplayLedge>
        )}
      </CabinetFrame>
    </div>
  );
}

/* ----------------------------- sub-components ----------------------------- */

/** The timber cabinet: thick top rail, left/right stiles and a base. */
function CabinetFrame({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="relative overflow-hidden rounded-md"
      style={{
        background:
          "linear-gradient(180deg,#3d2b1c 0%,#2a1c12 100%)",
        boxShadow:
          "0 18px 40px -12px rgba(0,0,0,0.7), inset 0 0 0 1px rgba(0,0,0,0.4)",
      }}
    >
      {/* top rail / wooden sign */}
      <header
        className="wood-grain relative flex items-center justify-center px-10 py-2"
        style={{
          background: "linear-gradient(180deg,#7a5638 0%,#5a3f28 100%)",
          boxShadow: "inset 0 -3px 6px rgba(0,0,0,0.4)",
        }}
      >
        <span className="text-lantern-glow/70">‹</span>
        <h2 className="mx-3 font-display text-sm font-bold tracking-[0.18em] text-parchment drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
          {title}
        </h2>
        <span className="text-lantern-glow/70">›</span>
      </header>

      {/* inner cavity with side stiles */}
      <div className="relative px-2.5 pb-2.5 pt-1">
        {/* left & right wooden sides */}
        <div
          className="pointer-events-none absolute inset-y-1 left-0 w-2.5"
          style={{ background: "linear-gradient(90deg,#5a3f28,#3d2b1c)" }}
        />
        <div
          className="pointer-events-none absolute inset-y-1 right-0 w-2.5"
          style={{ background: "linear-gradient(270deg,#5a3f28,#3d2b1c)" }}
        />
        <p className="mb-1 px-2 text-center text-[10px] tracking-wide text-sage/60">
          {subtitle}
        </p>
        {children}
      </div>
    </section>
  );
}

/** One internal shelf level: a dark recess, the spines, then a plank. */
function ShelfRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {/* back recess */}
      <div
        className="absolute inset-x-0 bottom-0 top-1"
        style={{
          background:
            "linear-gradient(180deg,#160e07 0%,#241710 60%,#160e07 100%)",
          boxShadow: "inset 0 8px 16px rgba(0,0,0,0.7)",
        }}
      />
      {/* spines, scrollable horizontally if the row overflows */}
      <div className="no-scrollbar relative z-10 flex items-end justify-start gap-[1px] overflow-x-auto overflow-y-visible px-1.5 pt-3">
        {children}
      </div>
      {/* the plank */}
      <div className="relative z-20">
        <div
          className="wood-grain h-2.5 w-full"
          style={{
            background:
              "linear-gradient(180deg,#7a5638 0%,#5a3f28 45%,#3d2b1c 100%)",
            boxShadow:
              "0 5px 10px rgba(0,0,0,0.55), inset 0 1px 1px rgba(255,255,255,0.08)",
          }}
        />
      </div>
    </div>
  );
}

/** The bottom face-out display row (店主のおすすめ). Covers lean on a ledge. */
function DisplayLedge({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mt-1">
      <div
        className="absolute inset-x-0 bottom-0 top-1"
        style={{
          background:
            "linear-gradient(180deg,#160e07 0%,#241710 70%,#160e07 100%)",
          boxShadow: "inset 0 8px 16px rgba(0,0,0,0.7)",
        }}
      />
      <div
        className="no-scrollbar relative z-10 flex items-end justify-start gap-3 overflow-x-auto px-3 pb-1 pt-4"
        style={{ perspective: 700 }}
      >
        {children}
      </div>
      <div className="relative z-20">
        <div
          className="wood-grain h-3 w-full"
          style={{
            background:
              "linear-gradient(180deg,#8a6440 0%,#5a3f28 50%,#3d2b1c 100%)",
            boxShadow:
              "0 6px 12px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.1)",
          }}
        />
      </div>
    </div>
  );
}
