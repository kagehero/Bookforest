"use client";

import { AnimatePresence, Reorder, motion } from "framer-motion";
import { useState } from "react";
import type { Book, Shelf, ShelfCategory } from "@/types/book";
import type { NewBookInput, NewShelfInput } from "@/lib/repository";

interface AdminPanelProps {
  open: boolean;
  onClose: () => void;
  shelves: Shelf[];
  getBooksForShelf: (shelf: Shelf) => Book[];
  onAddBook: (input: NewBookInput) => Promise<void>;
  onCreateShelf: (input: NewShelfInput) => Promise<void>;
  onReorder: (shelfId: string, bookIds: string[]) => Promise<void>;
}

const CATEGORIES: { value: ShelfCategory; label: string }[] = [
  { value: "recommended", label: "おすすめ" },
  { value: "new-arrivals", label: "新着" },
  { value: "seasonal", label: "季節" },
];

/**
 * Hidden admin simulation. Demonstrates the write side of the repository:
 * adding books, creating shelves and drag-reordering a shelf. All mutations go
 * through the repository, mirroring how a future Shopify Admin integration would
 * behave — the UI is identical regardless of backing store.
 */
export function AdminPanel({
  open,
  onClose,
  shelves,
  getBooksForShelf,
  onAddBook,
  onCreateShelf,
  onReorder,
}: AdminPanelProps) {
  const [tab, setTab] = useState<"books" | "shelves" | "arrange">("books");

  // add-book form
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [price, setPrice] = useState(1480);
  const [cat, setCat] = useState<ShelfCategory>("recommended");
  const [color, setColor] = useState("#2f4a36");

  // create-shelf form
  const [shelfTitle, setShelfTitle] = useState("");
  const [shelfCat, setShelfCat] = useState<ShelfCategory>("seasonal");

  // arrange
  const [activeShelfId, setActiveShelfId] = useState(shelves[0]?.id ?? "");
  const activeShelf = shelves.find((s) => s.id === activeShelfId) ?? shelves[0];
  const arrangeBooks = activeShelf ? getBooksForShelf(activeShelf) : [];

  const submitBook = async () => {
    if (!title.trim() || !author.trim()) return;
    await onAddBook({
      title: title.trim(),
      author: author.trim(),
      priceAmount: price,
      category: cat,
      spineColor: color,
    });
    setTitle("");
    setAuthor("");
  };

  const submitShelf = async () => {
    if (!shelfTitle.trim()) return;
    await onCreateShelf({ title: shelfTitle.trim(), category: shelfCat });
    setShelfTitle("");
  };

  const handleReorder = (books: Book[]) => {
    if (!activeShelf) return;
    onReorder(activeShelf.id, books.map((b) => b.id));
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-[80] flex flex-col bg-black/70 backdrop-blur"
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 240, damping: 30 }}
            className="no-scrollbar mt-auto max-h-[88%] overflow-y-auto rounded-t-3xl border-t border-wood-warm/30 bg-forest-deepest px-5 pb-10 pt-5"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-sage/40" />
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg text-parchment">
                店主のための管理画面
              </h2>
              <button
                onClick={onClose}
                className="text-xs tracking-widest text-sage/70"
              >
                閉じる ✕
              </button>
            </div>
            <p className="mb-4 text-[11px] leading-relaxed text-sage/60">
              ※ これは Shopify 連携を想定したモック管理機能です。変更はこのセッション中のみ保持されます。
            </p>

            {/* tabs */}
            <div className="mb-5 flex gap-2">
              {(
                [
                  ["books", "本を追加"],
                  ["shelves", "本棚を作る"],
                  ["arrange", "並び替え"],
                ] as const
              ).map(([k, label]) => (
                <button
                  key={k}
                  onClick={() => setTab(k)}
                  className={`flex-1 rounded-xl py-2 text-xs tracking-wide transition-colors ${
                    tab === k
                      ? "bg-wood-warm text-forest-deepest"
                      : "bg-forest-mid/50 text-parchment/70"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {tab === "books" && (
              <div className="space-y-3">
                <Field label="タイトル">
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="夜明けの図書館"
                    className="admin-input"
                  />
                </Field>
                <Field label="著者">
                  <input
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="森野 詩"
                    className="admin-input"
                  />
                </Field>
                <div className="flex gap-3">
                  <Field label="価格 (円)" className="flex-1">
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="admin-input"
                    />
                  </Field>
                  <Field label="背表紙の色" className="w-28">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="h-[42px] w-full rounded-lg border border-wood-warm/30 bg-transparent"
                    />
                  </Field>
                </div>
                <Field label="本棚">
                  <CategorySelect value={cat} onChange={setCat} />
                </Field>
                <button onClick={submitBook} className="admin-primary">
                  本棚に並べる
                </button>
              </div>
            )}

            {tab === "shelves" && (
              <div className="space-y-3">
                <Field label="本棚の名前">
                  <input
                    value={shelfTitle}
                    onChange={(e) => setShelfTitle(e.target.value)}
                    placeholder="真夜中の本棚"
                    className="admin-input"
                  />
                </Field>
                <Field label="カテゴリ">
                  <CategorySelect value={shelfCat} onChange={setShelfCat} />
                </Field>
                <button onClick={submitShelf} className="admin-primary">
                  新しい本棚を作る
                </button>

                <div className="mt-5 space-y-2">
                  <p className="text-[11px] tracking-widest text-sage/60">
                    現在の本棚 ({shelves.length})
                  </p>
                  {shelves.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between rounded-lg bg-forest-mid/40 px-3 py-2"
                    >
                      <span className="text-sm text-parchment">{s.title}</span>
                      <span className="text-[11px] text-sage/60">
                        {s.bookIds.length} 冊
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "arrange" && (
              <div className="space-y-3">
                <Field label="並び替える本棚">
                  <select
                    value={activeShelfId}
                    onChange={(e) => setActiveShelfId(e.target.value)}
                    className="admin-input"
                  >
                    {shelves.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </Field>
                <p className="text-[11px] text-sage/60">
                  ドラッグして本の並び順を変更できます。
                </p>
                <Reorder.Group
                  axis="y"
                  values={arrangeBooks}
                  onReorder={handleReorder}
                  className="space-y-2"
                >
                  {arrangeBooks.map((b) => (
                    <Reorder.Item
                      key={b.id}
                      value={b}
                      className="flex cursor-grab items-center gap-3 rounded-lg border border-wood-warm/20 bg-forest-mid/50 px-3 py-2.5 active:cursor-grabbing"
                    >
                      <span
                        className="h-8 w-2 rounded-sm"
                        style={{ background: b.spine.color }}
                      />
                      <span className="flex-1 truncate text-sm text-parchment">
                        {b.title}
                      </span>
                      <span className="text-sage/40">⋮⋮</span>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-[11px] tracking-widest text-sage/70">
        {label}
      </span>
      {children}
    </label>
  );
}

function CategorySelect({
  value,
  onChange,
}: {
  value: ShelfCategory;
  onChange: (v: ShelfCategory) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as ShelfCategory)}
      className="admin-input"
    >
      {CATEGORIES.map((c) => (
        <option key={c.value} value={c.value}>
          {c.label}
        </option>
      ))}
    </select>
  );
}
