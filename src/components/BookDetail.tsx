"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { Book } from "@/types/book";
import { BookCover } from "./BookCover";
import { formatDimensions, formatPrice } from "@/lib/format";

interface BookDetailProps {
  book: Book | null;
  onClose: () => void;
  onReadSample: (book: Book) => void;
  onAddToCart: (book: Book) => void;
  onBuyNow: (book: Book) => void;
}

const spring = { type: "spring", stiffness: 220, damping: 26, mass: 0.9 } as const;

/**
 * The book-discovery overlay — a faithful realisation of the reference
 * storyboard. After a spine is tapped it plays out in two phases:
 *
 *  ② 本を引き抜く — the book pops *forward out of the shelf*, tilted and still
 *     CLOSED (edge/page-block toward us), inviting「開いて読む」.
 *  ③ 表紙が見える — tapping「開いて読む」(or the book) opens it: the front cover
 *     rotates to face the reader and the detail sheet rises (⑤).
 *
 * Step ④ (試し読み) is the separate ReadingView, launched from「試し読み」.
 */
type Phase = "pulled" | "open";

export function BookDetail({
  book,
  onClose,
  onReadSample,
  onAddToCart,
  onBuyNow,
}: BookDetailProps) {
  const [phase, setPhase] = useState<Phase>("pulled");

  // Every time a new book is selected, restart at the "pulled out" phase.
  useEffect(() => {
    if (book) setPhase("pulled");
  }, [book]);

  const opened = phase === "open";

  return (
    <AnimatePresence>
      {book && (
        <motion.div
          className="absolute inset-0 z-50 flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* darkening ambient backdrop (deepens once the book opens) */}
          <motion.button
            aria-label="本棚にもどる"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
            style={{
              background: opened
                ? "radial-gradient(120% 90% at 50% 30%, rgba(20,30,22,0.78) 0%, rgba(0,0,0,0.94) 100%)"
                : "radial-gradient(120% 90% at 50% 35%, rgba(20,30,22,0.55) 0%, rgba(0,0,0,0.8) 100%)",
              transition: "background 0.5s ease",
            }}
          />

          <div className="no-scrollbar relative z-10 flex h-full flex-col overflow-y-auto">
            {/* ── Cover stage ───────────────────────────────────────────── */}
            <div
              onClick={onClose}
              className="flex shrink-0 cursor-pointer items-center justify-center px-6 pb-2 pt-12"
            >
              <motion.div
                onClick={(e) => {
                  e.stopPropagation();
                  if (!opened) setPhase("open");
                }}
                style={{
                  transformPerspective: 1500,
                  transformStyle: "preserve-3d",
                  cursor: opened ? "default" : "pointer",
                }}
                /* ②: enters from the shelf — small, tilted, lifted, CLOSED.
                   ③: opens — settles upright and forward, cover facing us. */
                initial={{ rotateY: 64, rotateZ: -5, y: 70, scale: 0.7, opacity: 0 }}
                animate={
                  opened
                    ? { rotateY: -8, rotateZ: 0, y: 0, scale: 1, opacity: 1 }
                    : { rotateY: 38, rotateZ: -3, y: 0, scale: 0.92, opacity: 1 }
                }
                transition={spring}
                className="relative drop-shadow-[0_30px_50px_rgba(0,0,0,0.7)]"
              >
                <BookCover book={book} width={206} />
              </motion.div>
            </div>

            {/* ②: hint + 「開いて読む」, shown only while the book is still closed */}
            <AnimatePresence>
              {!opened && (
                <motion.div
                  key="open-cta"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ delay: 0.25, duration: 0.4 }}
                  className="flex flex-col items-center gap-4 px-6 pt-4"
                >
                  <p className="text-center text-xs tracking-[0.18em] text-sage/80">
                    本が手前に飛び出しました
                  </p>
                  <motion.button
                    onClick={() => setPhase("open")}
                    whileTap={{ scale: 0.96 }}
                    whileHover={{ scale: 1.03 }}
                    className="inline-flex items-center gap-2 rounded-full border border-lantern-glow/45 bg-forest-mid/70 px-9 py-3.5 font-serif text-sm tracking-[0.16em] text-parchment shadow-lg backdrop-blur-sm"
                  >
                    開いて読む
                    <span className="text-lantern-glow">›</span>
                  </motion.button>
                  <button
                    onClick={onClose}
                    className="text-[11px] tracking-widest text-sage/55"
                  >
                    ← 本棚にもどす
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ⑤: the detail sheet rises once the book is open */}
            <AnimatePresence>
              {opened && (
                <motion.div
                  key="detail-sheet"
                  initial={{ y: 90, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 60, opacity: 0 }}
                  transition={{ ...spring, delay: 0.05 }}
                  className="mt-3 flex-1 rounded-t-3xl border-t border-lantern-glow/15 bg-forest-deep/95 px-6 pb-10 pt-6 shadow-2xl backdrop-blur"
                >
                  <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-sage/40" />

                  <h2 className="font-display text-2xl font-bold leading-snug text-parchment">
                    {book.title}
                  </h2>
                  <p className="mt-1 text-sm tracking-wide text-sage">
                    {book.author}
                  </p>

                  <p className="mt-4 font-serif text-[15px] leading-relaxed text-parchment/80">
                    {book.description}
                  </p>

                  {/* meta */}
                  <dl className="mt-6 grid grid-cols-3 gap-3 border-y border-wood-warm/20 py-4 text-center">
                    <div>
                      <dt className="text-[10px] tracking-widest text-sage/70">価格</dt>
                      <dd className="mt-1 font-display text-base text-lantern-warm">
                        {formatPrice(book.price)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10px] tracking-widest text-sage/70">ページ</dt>
                      <dd className="mt-1 font-display text-base text-parchment">
                        {book.pageCount}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10px] tracking-widest text-sage/70">判型</dt>
                      <dd className="mt-1 text-[11px] leading-tight text-parchment/85">
                        {book.dimensions.heightMm}×{book.dimensions.widthMm}
                        <span className="text-[9px]">mm</span>
                      </dd>
                    </div>
                  </dl>
                  <p className="mt-1 text-center text-[10px] text-sage/50">
                    {formatDimensions(book.dimensions)}
                  </p>

                  {/* actions — ④ 試し読み + ⑤ カート / 今すぐ購入 / 戻る */}
                  <div className="mt-7 space-y-3">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => onReadSample(book)}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-lantern-glow/40 bg-forest-mid/60 py-4 font-serif text-sm tracking-wider text-parchment"
                    >
                      <span>📖</span> 試し読みをする
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => onAddToCart(book)}
                      className="w-full rounded-2xl bg-gradient-to-b from-lantern-amber to-wood-warm py-4 font-serif text-sm font-semibold tracking-wider text-forest-deepest shadow-lg"
                    >
                      カートに入れる
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => onBuyNow(book)}
                      className="w-full rounded-2xl border border-lantern-glow/30 bg-forest-mid/40 py-4 font-serif text-sm tracking-wider text-parchment"
                    >
                      今すぐ購入する
                    </motion.button>

                    <button
                      onClick={onClose}
                      className="w-full py-2 text-center text-xs tracking-widest text-sage/70"
                    >
                      ← 本棚にもどる
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
