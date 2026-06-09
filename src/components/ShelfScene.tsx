"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import type { Book, ShelfCategory } from "@/types/book";
import { useBookstore } from "@/hooks/useBookstore";
import { Bookshelf } from "./Bookshelf";
import { BookDetail } from "./BookDetail";
import { ReadingView } from "./ReadingView";
import { CartToast } from "./CartToast";
import { AdminPanel } from "./AdminPanel";
import { Particles } from "./Particles";

interface ShelfSceneProps {
  onExit: () => void;
}

/**
 * The bookstore interior. Owns selection/cart/reading/admin state and wires the
 * shelves to all the overlays. The atmosphere (wood backdrop, lantern haze,
 * drifting motes) is preserved here so the room still feels like the forest.
 */
export function ShelfScene({ onExit }: ShelfSceneProps) {
  const store = useBookstore();
  const [activeCategory, setActiveCategory] = useState<ShelfCategory | "all">(
    "all",
  );
  const [selected, setSelected] = useState<Book | null>(null);
  const [reading, setReading] = useState<Book | null>(null);
  const [adminOpen, setAdminOpen] = useState(false);

  const [cart, setCart] = useState<Book[]>([]);
  const [lastAdded, setLastAdded] = useState<Book | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hidden admin: triple-tap the title within 800ms.
  const tapCount = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const secretTap = () => {
    tapCount.current += 1;
    if (tapTimer.current) clearTimeout(tapTimer.current);
    if (tapCount.current >= 3) {
      tapCount.current = 0;
      setAdminOpen(true);
      return;
    }
    tapTimer.current = setTimeout(() => (tapCount.current = 0), 800);
  };

  const addToCart = (book: Book) => {
    setCart((c) => [...c, book]);
    setLastAdded(book);
    setSelected(null);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setLastAdded(null), 2600);
  };

  // ⑤ 今すぐ購入 — in this prototype, buy-now adds to the cart and confirms,
  // standing in for a future Shopify checkout redirect.
  const buyNow = (book: Book) => {
    addToCart(book);
  };

  const tabs: { value: ShelfCategory | "all"; label: string }[] = [
    { value: "all", label: "すべて" },
    { value: "recommended", label: "おすすめ" },
    { value: "new-arrivals", label: "新着" },
    { value: "seasonal", label: "季節" },
  ];

  // The sign + sub-label shown on the single cabinet for each tab.
  const CABINET_LABELS: Record<
    ShelfCategory | "all",
    { title: string; subtitle: string }
  > = {
    all: { title: "本の森の本棚", subtitle: "すべての物語が、ここに並んでいます" },
    recommended: { title: "おすすめの本棚", subtitle: "店主が選ぶ、今宵の一冊" },
    "new-arrivals": { title: "あたらしい本棚", subtitle: "森に届いたばかりの物語" },
    seasonal: { title: "季節の本棚", subtitle: "巡る季節に寄りそう selection" },
  };

  // One cabinet, always. "すべて" mixes every category; a tab filters in place so
  // only matching books remain on the same shelf and the rest disappear.
  const cabinetBooks = useMemo(() => {
    if (activeCategory === "all") return store.books;
    return store.books.filter((b) => b.category === activeCategory);
  }, [store.books, activeCategory]);

  const cabinet = CABINET_LABELS[activeCategory];

  return (
    <section className="relative h-full w-full overflow-hidden bg-forest-deepest">
      {/* room ambience — fixed to the phone frame, behind the scrolling content */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(100% 60% at 50% 0%, rgba(47,74,54,0.35) 0%, transparent 55%), radial-gradient(120% 80% at 50% 100%, rgba(122,86,56,0.18) 0%, transparent 60%)",
        }}
      />
      <div className="pointer-events-none absolute left-1/2 top-10 z-0 h-40 w-40 -translate-x-1/2 rounded-full bg-lantern-glow/15 blur-3xl animate-flicker" />
      <Particles count={18} className="absolute z-0 opacity-60" />

      {/* scroll region — header sticks to the top of the frame, shelves scroll */}
      <div className="no-scrollbar relative z-10 h-full overflow-y-auto">
      {/* header */}
      <header className="sticky top-0 z-30 border-b border-wood-warm/15 bg-forest-deepest/85 px-5 pb-3 pt-4 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <button onClick={onExit} className="text-sm text-sage/70">
            ← 森へ
          </button>
          <h1
            onClick={secretTap}
            className="select-none font-display text-xl font-bold tracking-[0.15em] text-parchment"
          >
            本の森
          </h1>
          <div className="flex items-center gap-1 text-sm text-parchment/80">
            <span>🛒</span>
            <span className="min-w-4 text-center font-display">{cart.length}</span>
          </div>
        </div>

        {/* category tabs */}
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.value}
              onClick={() => setActiveCategory(t.value)}
              className="relative shrink-0 rounded-full px-4 py-1.5 text-xs tracking-wide transition-colors"
            >
              {activeCategory === t.value && (
                <motion.span
                  layoutId="tab-pill"
                  className="absolute inset-0 rounded-full bg-wood-warm/80"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span
                className={`relative ${
                  activeCategory === t.value
                    ? "text-forest-deepest"
                    : "text-parchment/70"
                }`}
              >
                {t.label}
              </span>
            </button>
          ))}
        </div>
      </header>

      {/* shelves */}
      <div className="relative z-10 space-y-6 pb-24 pt-6">
        {store.loading ? (
          <div className="flex h-[50vh] items-center justify-center text-sm text-sage/60">
            本棚を整えています…
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <Bookshelf
                title={cabinet.title}
                subtitle={cabinet.subtitle}
                books={cabinetBooks}
                onSelect={setSelected}
                pulledBookId={selected?.id ?? null}
              />
            </motion.div>
          </AnimatePresence>
        )}
      </div>
      </div>
      {/* end scroll region */}

      {/* overlays — absolute within the phone frame, so they clip to it */}
      <BookDetail
        book={selected}
        onClose={() => setSelected(null)}
        onReadSample={(b) => setReading(b)}
        onAddToCart={addToCart}
        onBuyNow={buyNow}
      />

      <AnimatePresence>
        {reading && (
          <ReadingView book={reading} onClose={() => setReading(null)} />
        )}
      </AnimatePresence>

      <CartToast book={lastAdded} count={cart.length} />

      <AdminPanel
        open={adminOpen}
        onClose={() => setAdminOpen(false)}
        shelves={store.shelves}
        getBooksForShelf={store.getBooksForShelf}
        onAddBook={store.addBook}
        onCreateShelf={store.createShelf}
        onReorder={store.setShelfOrder}
      />
    </section>
  );
}
