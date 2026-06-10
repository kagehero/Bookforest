"use client";

import type { Book } from "@/types/book";

interface BookCoverProps {
  book: Book;
  /** Width in px; height derives from book proportions. */
  width?: number;
  className?: string;
}

/**
 * A CSS-rendered front cover with a faux 3D edge (page block + spine sliver),
 * a foil-ish title treatment and the cover tagline. Proportioned from the
 * book's real trim size so each cover feels individual.
 */
export function BookCover({ book, width = 200, className = "" }: BookCoverProps) {
  const ratio = book.dimensions.heightMm / book.dimensions.widthMm;
  const height = Math.round(width * ratio);

  return (
    <div
      className={`relative ${className}`}
      style={{ width, height, perspective: 1200 }}
    >
      {/* page block edge (right) */}
      <div
        className="absolute right-0 top-1 bottom-1 w-2 rounded-r-sm"
        style={{
          transform: "translateX(7px)",
          background:
            "repeating-linear-gradient(180deg,#efe7d2 0 1px,#d8c9a8 1px 2px)",
        }}
      />
      {/* the cover face */}
      <div
        className="relative h-full w-full overflow-hidden rounded-l-[3px] rounded-r-md shadow-book"
        style={{ background: book.cover.background, color: book.cover.textColor }}
      >
        {/* owner-supplied cover artwork, cover-fit over the face */}
        {book.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={book.coverImage}
            alt={`${book.title} の表紙`}
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
          />
        )}
        {/* spine sliver on the left */}
        <div
          className="absolute inset-y-0 left-0 w-3"
          style={{ background: "rgba(0,0,0,0.28)" }}
        />
        {/* top sheen */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(115deg, rgba(255,255,255,0.22) 0%, transparent 32%, transparent 100%)",
          }}
        />
        {/* decorative frame — only over the CSS-rendered artwork */}
        {!book.coverImage && (
          <div
            className="absolute inset-3 rounded-sm border"
            style={{ borderColor: "currentColor", opacity: 0.3 }}
          />
        )}

        {!book.coverImage && (
        <div className="relative flex h-full flex-col items-center justify-between px-5 py-7 text-center">
          <span className="text-[10px] tracking-[0.35em] opacity-70">
            HON NO MORI
          </span>

          <div className="flex flex-col items-center">
            <h3 className="vertical-text mx-auto font-display text-xl font-bold leading-tight">
              {book.title}
            </h3>
          </div>

          <div className="space-y-1">
            {book.cover.tagline && (
              <p className="text-[11px] italic leading-snug opacity-80">
                {book.cover.tagline}
              </p>
            )}
            <p className="text-xs tracking-widest opacity-85">{book.author}</p>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
