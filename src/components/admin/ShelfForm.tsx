"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Book, Shelf, ShelfCategory, ShelfKind } from "@/types/book";
import { Field } from "./ui";

interface ShelfFormProps {
  shelf: Shelf | null;
  books: Book[];
  onSave: (shelf: Shelf) => void;
  onCancel: () => void;
}

const KINDS: { value: ShelfKind; label: string; category: ShelfCategory }[] = [
  { value: "recommended", label: "おすすめ棚", category: "recommended" },
  { value: "new", label: "新着棚", category: "new-arrivals" },
  { value: "seasonal", label: "季節棚", category: "seasonal" },
  { value: "custom", label: "特集棚", category: "recommended" },
];

function emptyShelf(): Shelf {
  return {
    id: "",
    category: "recommended",
    title: "",
    subtitle: "",
    description: "",
    kind: "custom",
    displayOrder: 99,
    bookIds: [],
  };
}

/**
 * Add/edit a shelf, including which books it holds and their order. Reordering is
 * intentionally button-based (上へ / 下へ / 外す) so it is obvious to a
 * non-technical owner — no drag target to miss.
 */
export function ShelfForm({ shelf, books, onSave, onCancel }: ShelfFormProps) {
  const [draft, setDraft] = useState<Shelf>(() => ({ ...emptyShelf(), ...(shelf ?? {}) }));
  const isEdit = Boolean(shelf);
  const byId = new Map(books.map((b) => [b.id, b]));

  function set<K extends keyof Shelf>(key: K, value: Shelf[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function move(index: number, dir: -1 | 1) {
    setDraft((d) => {
      const ids = [...d.bookIds];
      const to = index + dir;
      if (to < 0 || to >= ids.length) return d;
      [ids[index], ids[to]] = [ids[to], ids[index]];
      return { ...d, bookIds: ids };
    });
  }
  function removeAt(index: number) {
    setDraft((d) => ({ ...d, bookIds: d.bookIds.filter((_, i) => i !== index) }));
  }
  function addBook(id: string) {
    setDraft((d) => (d.bookIds.includes(id) ? d : { ...d, bookIds: [...d.bookIds, id] }));
  }

  const canSave = draft.title.trim().length > 0;
  const available = books.filter((b) => !draft.bookIds.includes(b.id));

  function handleSave() {
    if (!canSave) return;
    const kindMeta = KINDS.find((k) => k.value === draft.kind);
    onSave({
      ...draft,
      title: draft.title.trim(),
      subtitle: draft.subtitle.trim() || draft.description?.trim() || "店主が設えた本棚",
      description: draft.description?.trim() || "",
      category: kindMeta?.category ?? draft.category,
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="dash-card p-6 md:p-8"
    >
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">
          {isEdit ? "棚を編集" : "棚を追加"}
        </h2>
        <button onClick={onCancel} className="text-[14px] font-semibold text-[#9a8362]">
          閉じる ✕
        </button>
      </div>

      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="棚名">
            <input
              className="dash-field"
              value={draft.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="冬におすすめの本棚"
            />
          </Field>
          <Field label="表示順" hint="数字が小さいほど上に表示されます。">
            <input
              type="number"
              className="dash-field"
              value={draft.displayOrder ?? 0}
              onChange={(e) => set("displayOrder", Number(e.target.value) || 0)}
            />
          </Field>
        </div>

        <Field label="説明">
          <input
            className="dash-field"
            value={draft.description ?? ""}
            onChange={(e) => set("description", e.target.value)}
            placeholder="この棚のテーマを、ひとことで。"
          />
        </Field>

        <Field label="棚タイプ">
          <div className="flex flex-wrap gap-2">
            {KINDS.map((k) => (
              <button
                key={k.value}
                type="button"
                onClick={() => set("kind", k.value)}
                className={`rounded-xl border px-4 py-2.5 text-[14px] font-semibold transition-colors ${
                  draft.kind === k.value
                    ? "border-[#c98a3c] bg-[#fbeed3] text-[#7a4e16]"
                    : "border-[#e0d3b8] bg-white/60 text-[#7a6a4a]"
                }`}
              >
                {k.label}
              </button>
            ))}
          </div>
        </Field>

        {/* Books in the shelf, with order controls */}
        <div>
          <p className="dash-label">表示する本 ・ 並び順（{draft.bookIds.length} 冊）</p>
          {draft.bookIds.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[#d8c9a8] bg-white/40 px-4 py-6 text-center text-[14px] text-[#9a8362]">
              下の一覧から、この棚に並べる本を選んでください。
            </p>
          ) : (
            <ul className="space-y-2">
              {draft.bookIds.map((id, i) => {
                const b = byId.get(id);
                if (!b) return null;
                return (
                  <li
                    key={id}
                    className="flex items-center gap-3 rounded-xl border border-[#e6dcc6] bg-white/70 px-3 py-2.5"
                  >
                    <span className="w-6 text-center font-display text-[14px] font-bold text-[#b5a079]">
                      {i + 1}
                    </span>
                    <span
                      className="h-9 w-2 shrink-0 rounded-sm"
                      style={{ background: b.spine.color }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-semibold">
                        {b.title}
                      </span>
                      <span className="block text-[12px] text-[#9a8362]">{b.author}</span>
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => move(i, -1)}
                        disabled={i === 0}
                        className="grid h-8 w-8 place-items-center rounded-lg bg-[#f0e6d2] text-[#6a523a] disabled:opacity-30"
                        aria-label="上へ"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => move(i, 1)}
                        disabled={i === draft.bookIds.length - 1}
                        className="grid h-8 w-8 place-items-center rounded-lg bg-[#f0e6d2] text-[#6a523a] disabled:opacity-30"
                        aria-label="下へ"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => removeAt(i)}
                        className="ml-1 rounded-lg px-3 py-1.5 text-[13px] font-semibold text-[#a14b32] hover:bg-[#fbeee9]"
                      >
                        外す
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Add books */}
        {available.length > 0 && (
          <div>
            <p className="dash-label">棚に追加できる本</p>
            <div className="flex flex-wrap gap-2">
              {available.map((b) => (
                <button
                  key={b.id}
                  onClick={() => addBook(b.id)}
                  className="rounded-full border border-[#e0d3b8] bg-white/60 px-3.5 py-2 text-[13.5px] font-semibold text-[#6a523a] transition-colors hover:bg-white"
                >
                  ＋ {b.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button onClick={handleSave} disabled={!canSave} className="dash-btn-primary">
          {isEdit ? "保存する" : "棚を追加する"}
        </button>
        <button onClick={onCancel} className="dash-btn-ghost">
          キャンセル
        </button>
        {!canSave && (
          <span className="self-center text-[13px] text-[#b08a5a]">
            棚名を入力してください
          </span>
        )}
      </div>
    </motion.div>
  );
}
