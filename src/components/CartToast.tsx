"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { Book } from "@/types/book";

interface CartToastProps {
  book: Book | null;
  count: number;
}

/** Small confirmation that floats up when a book is added to the cart. */
export function CartToast({ book, count }: CartToastProps) {
  return (
    <AnimatePresence>
      {book && (
        <motion.div
          key={`${book.id}-${count}`}
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 320, damping: 26 }}
          className="absolute inset-x-0 bottom-6 z-[70] mx-auto flex w-[min(92%,420px)] items-center gap-3 rounded-2xl border border-lantern-glow/30 bg-forest-deep/95 px-4 py-3 shadow-2xl backdrop-blur"
        >
          <span className="text-lg">🛒</span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-sm text-parchment">
              「{book.title}」をカートに入れました
            </p>
            <p className="text-[11px] text-sage/70">カート内 {count} 冊</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
