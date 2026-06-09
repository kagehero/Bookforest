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
/** Estimated on-screen spine width (incl. margins) for a given thickness.
 *  Must mirror `spineWidth` in BookSpine so row-packing wraps correctly. */
function estSpineWidth(thicknessMm: number): number {
  const raw = Math.max(18, Math.min(44, 16 + (thicknessMm - 13) * 1.9));
  return Math.round(raw * SPINE_SCALE) + 2;
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

      {/* inner cavity with thick side stiles. The stiles are real timber posts:
          a lit outer arris, grained body, and a dark inner bevel that throws the
          cavity into shadow — so the shelves sit inside a believable carcass. */}
      <div className="relative px-3.5 pb-3 pt-1">
        {/* left stile */}
        <div
          className="wood-grain pointer-events-none absolute inset-y-1 left-0 z-30 w-3.5"
          style={{
            background:
              "linear-gradient(90deg,#8a6440 0%,#5a3f28 45%,#2e1f13 100%)",
            boxShadow: "inset -2px 0 4px rgba(0,0,0,0.5)",
          }}
        />
        {/* right stile */}
        <div
          className="wood-grain pointer-events-none absolute inset-y-1 right-0 z-30 w-3.5"
          style={{
            background:
              "linear-gradient(270deg,#8a6440 0%,#5a3f28 45%,#2e1f13 100%)",
            boxShadow: "inset 2px 0 4px rgba(0,0,0,0.5)",
          }}
        />
        <p className="mb-1 px-2 text-center text-[10px] tracking-wide text-sage/60">
          {subtitle}
        </p>
        {children}
      </div>
    </section>
  );
}

/** One internal shelf level: a recessed cavity the books stand inside, then the
 *  front edge of the timber plank they rest on. Real shelves read as a *box*:
 *  a shadowed back wall, soft ambient-occlusion in the upper corners where the
 *  shelf above meets the back, warm light spilling from the top, and a plank
 *  whose front edge catches that light while its underside falls into shadow. */
function ShelfRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {/* back wall of the cavity — darker at the bottom where books meet it */}
      <div
        className="absolute inset-x-0 bottom-0 top-0"
        style={{
          background:
            "linear-gradient(180deg,#14110d 0%,#211913 22%,#2c2117 70%,#1a120c 100%)",
        }}
      />
      {/* deep shadow cast by the shelf above onto the back wall + top corners */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-8"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.18) 55%, transparent 100%)",
        }}
      />
      {/* warm light grazing the top of the cavity from the lanterns */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-0 z-[6] h-10 opacity-40"
        style={{
          background:
            "radial-gradient(120% 100% at 50% 0%, rgba(255,207,138,0.4) 0%, transparent 70%)",
        }}
      />
      {/* spines, scrollable horizontally if the row overflows. The negative
          bottom margin tucks their feet a hair behind the plank's front edge so
          they read as standing *inside* the shelf, not floating on top. */}
      <div className="no-scrollbar relative z-10 -mb-px flex items-end justify-start gap-[1px] overflow-x-auto overflow-y-visible px-2 pt-5">
        {children}
      </div>
      {/* the plank the books stand on — a 3D timber edge: lit top lip, grained
          face, shadowed underside, and a contact shadow it casts below. */}
      <div className="relative z-20">
        <div
          aria-hidden
          className="h-[3px] w-full"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,224,170,0.5) 0%, rgba(150,108,66,0.6) 100%)",
          }}
        />
        <div
          className="wood-grain h-3 w-full"
          style={{
            background:
              "linear-gradient(180deg,#8a6440 0%,#6b4a2e 35%,#4a3320 80%,#34241600 100%)",
            boxShadow:
              "0 7px 14px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.12)",
          }}
        />
      </div>
    </div>
  );
}

/** The bottom face-out display row (店主のおすすめ). Featured covers stand and
 *  lean back on a real timber ledge, lit from above. */
function DisplayLedge({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mt-1">
      {/* back wall of the display cavity */}
      <div
        className="absolute inset-x-0 bottom-0 top-0"
        style={{
          background:
            "linear-gradient(180deg,#14110d 0%,#241a12 60%,#1a120c 100%)",
        }}
      />
      {/* shadow from the shelf above */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-9"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)",
        }}
      />
      {/* warm graze of lantern light over the displayed covers */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-4 top-1 z-[6] h-12 opacity-45"
        style={{
          background:
            "radial-gradient(120% 100% at 50% 0%, rgba(255,207,138,0.45) 0%, transparent 70%)",
        }}
      />
      {/* The covers stand on the plank below; bottom-aligned so their lower edge
          meets the wood. Perspective origin sits above them so each cover's
          backward lean reads as a real tip-back rather than a flat shrink. */}
      <div
        className="no-scrollbar relative z-10 flex items-end justify-start gap-3.5 overflow-x-auto px-4 pb-0 pt-7"
        style={{ perspective: 620, perspectiveOrigin: "50% 0%" }}
      >
        {children}
      </div>
      {/* the timber ledge — matches the shelf planks: lit lip, grain, shadow */}
      <div className="relative z-20">
        <div
          aria-hidden
          className="h-[3px] w-full"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,224,170,0.55) 0%, rgba(150,108,66,0.6) 100%)",
          }}
        />
        <div
          className="wood-grain h-3.5 w-full"
          style={{
            background:
              "linear-gradient(180deg,#946a44 0%,#6b4a2e 35%,#4a3320 80%,#2e2014 100%)",
            boxShadow:
              "0 8px 16px rgba(0,0,0,0.62), inset 0 1px 1px rgba(255,255,255,0.14)",
          }}
        />
      </div>
    </div>
  );
}
