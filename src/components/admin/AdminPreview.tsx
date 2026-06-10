"use client";

import { AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import type { Book, Shelf } from "@/types/book";
import { Bookshelf } from "@/components/Bookshelf";
import { BookDetail } from "@/components/BookDetail";

interface AdminPreviewProps {
  books: Book[];
  shelves: Shelf[];
}

/**
 * A faithful mini-render of the public bookshelf, using the SAME components the
 * customer sees. Pick a shelf and the spines pack with real heights/thicknesses;
 * tap one to open the detail overlay — exactly as the store does.
 */
export function AdminPreview({ books, shelves }: AdminPreviewProps) {
  const [shelfId, setShelfId] = useState<string>(shelves[0]?.id ?? "");
  const [selected, setSelected] = useState<Book | null>(null);

  const activeShelf = shelves.find((s) => s.id === shelfId) ?? shelves[0];

  const shelfBooks = useMemo(() => {
    if (!activeShelf) return [];
    const byId = new Map(books.map((b) => [b.id, b]));
    return activeShelf.bookIds
      .map((id) => byId.get(id))
      .filter((b): b is Book => Boolean(b));
  }, [activeShelf, books]);

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-display text-3xl font-bold">プレビュー</h1>
        <p className="mt-1 max-w-xl text-[14px] leading-relaxed text-[#8a7458]">
          保存した内容が、実際の本棚UIにどのように表示されるか確認できます。背表紙をタップすると、お客様と同じように本をひらけます。
        </p>
      </div>

      {/* Shelf picker */}
      <div className="mb-5 flex flex-wrap gap-2">
        {shelves.map((s) => (
          <button
            key={s.id}
            onClick={() => setShelfId(s.id)}
            className={`rounded-full border px-4 py-2 text-[14px] font-semibold transition-colors ${
              s.id === shelfId
                ? "border-[#c98a3c] bg-[#fbeed3] text-[#7a4e16]"
                : "border-[#e0d3b8] bg-white/60 text-[#7a6a4a]"
            }`}
          >
            {s.title}（{s.bookIds.length}）
          </button>
        ))}
      </div>

      {/* Phone frame — the live front-end UI */}
      <div className="flex justify-center">
        <div
          className="relative w-full max-w-[420px] overflow-hidden rounded-[2.2rem] border-[10px] border-[#13201a] bg-[#0c1410] shadow-[0_40px_90px_-30px_rgba(0,0,0,0.7)]"
          style={{ height: "min(720px, 80vh)" }}
        >
          {/* room ambience, matching the store */}
          <div
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              background:
                "radial-gradient(100% 60% at 50% 0%, rgba(47,74,54,0.35) 0%, transparent 55%), radial-gradient(120% 80% at 50% 100%, rgba(122,86,56,0.18) 0%, transparent 60%)",
            }}
          />
          <div className="pointer-events-none absolute left-1/2 top-10 z-0 h-40 w-40 -translate-x-1/2 rounded-full bg-lantern-glow/15 blur-3xl" />

          <div className="no-scrollbar relative z-10 h-full overflow-y-auto">
            <header className="sticky top-0 z-30 border-b border-wood-warm/15 bg-forest-deepest/85 px-5 pb-3 pt-4 backdrop-blur-md">
              <h1 className="text-center font-display text-xl font-bold tracking-[0.15em] text-parchment">
                本の森
              </h1>
              {activeShelf && (
                <p className="mt-1 text-center text-[11px] text-sage/70">
                  {activeShelf.title}
                </p>
              )}
            </header>

            <div className="relative z-10 space-y-6 pb-24 pt-6">
              {activeShelf ? (
                <Bookshelf
                  title={activeShelf.title}
                  subtitle={activeShelf.subtitle}
                  books={shelfBooks}
                  onSelect={setSelected}
                  pulledBookId={selected?.id ?? null}
                />
              ) : (
                <p className="px-6 py-16 text-center text-sm text-sage/60">
                  棚がありません。「本棚管理」から棚をつくってください。
                </p>
              )}
            </div>
          </div>

          {/* detail overlay, clipped to the frame just like the real app */}
          <AnimatePresence>
            {selected && (
              <BookDetail
                book={selected}
                onClose={() => setSelected(null)}
                onReadSample={() => {}}
                onAddToCart={() => setSelected(null)}
                onBuyNow={() => setSelected(null)}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      <p className="mt-4 text-center text-[12.5px] text-[#a08a66]">
        ※ これはプレビューです。実際の購入操作は行われません。
      </p>
    </div>
  );
}
