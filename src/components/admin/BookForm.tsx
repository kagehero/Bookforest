"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { Book, BookDisplaySize, SamplePage, Shelf, ShelfCategory } from "@/types/book";
import { BookCover } from "@/components/BookCover";
import { Field } from "./ui";

interface BookFormProps {
  /** The book being edited, or null when adding a new one. */
  book: Book | null;
  shelves: Shelf[];
  onSave: (book: Book) => void;
  onCancel: () => void;
}

const CATEGORIES: { value: ShelfCategory; label: string }[] = [
  { value: "recommended", label: "おすすめ" },
  { value: "new-arrivals", label: "新着" },
  { value: "seasonal", label: "季節" },
];

const SIZES: { value: BookDisplaySize; label: string }[] = [
  { value: "small", label: "小さめ" },
  { value: "medium", label: "ふつう" },
  { value: "large", label: "大きめ" },
];

function emptyBook(): Book {
  return {
    id: "",
    handle: "",
    title: "",
    author: "",
    description: "",
    spine: { color: "#2f4a36", accent: "#1d3327", textColor: "#f0e6d0", band: "#c9a24b" },
    cover: { background: "linear-gradient(160deg,#2f4a36,#13201a)", textColor: "#f0e6d0", tagline: "" },
    dimensions: { heightMm: 188, widthMm: 128, thicknessMm: 20 },
    pageCount: 240,
    price: { amount: 1480, currencyCode: "JPY" },
    category: "recommended",
    featured: false,
    displaySize: "medium",
    shelfIds: [],
    coverImage: "",
    spineImage: "",
    sample: [],
  };
}

/** Turn newline-separated text into structured sample pages (1 page each). */
function linesToSample(text: string): SamplePage[] {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return lines.map((line, i) => ({
    pageNumber: i + 1,
    heading: i === 0 ? "第一章" : undefined,
    paragraphs: [line],
  }));
}

function sampleToLines(sample: SamplePage[]): string {
  return sample.map((p) => p.paragraphs.join(" ")).join("\n");
}

/**
 * Full add/edit form for a single book. Edits every owner-facing field and shows
 * a live cover preview as the URLs / colours change. Saving hands back a complete
 * `Book` for the page to persist.
 */
export function BookForm({ book, shelves, onSave, onCancel }: BookFormProps) {
  const [draft, setDraft] = useState<Book>(() => ({ ...emptyBook(), ...(book ?? {}) }));
  const [sampleText, setSampleText] = useState<string>(() =>
    book ? sampleToLines(book.sample) : "",
  );

  const isEdit = Boolean(book);

  function set<K extends keyof Book>(key: K, value: Book[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }
  function setDim(key: keyof Book["dimensions"], value: number) {
    setDraft((d) => ({ ...d, dimensions: { ...d.dimensions, [key]: value } }));
  }

  // A book used purely for the live preview (keeps cover colours in sync).
  const previewBook: Book = useMemo(
    () => ({
      ...draft,
      title: draft.title || "（タイトル未入力）",
      author: draft.author || "著者名",
      cover: {
        ...draft.cover,
        background: draft.coverImage
          ? draft.cover.background
          : `linear-gradient(160deg,${draft.spine.color},${draft.spine.accent})`,
      },
    }),
    [draft],
  );

  const canSave = draft.title.trim().length > 0 && draft.author.trim().length > 0;

  function handleSave() {
    if (!canSave) return;
    const finalBook: Book = {
      ...draft,
      title: draft.title.trim(),
      author: draft.author.trim(),
      coverImage: draft.coverImage?.trim() || undefined,
      spineImage: draft.spineImage?.trim() || undefined,
      handle: draft.handle || draft.title.trim().toLowerCase().replace(/\s+/g, "-").slice(0, 40),
      // keep the cover gradient in sync with the spine when there's no image
      cover: {
        ...draft.cover,
        background: draft.coverImage?.trim()
          ? draft.cover.background
          : `linear-gradient(160deg,${draft.spine.color},${draft.spine.accent})`,
      },
      sample: sampleText.trim() ? linesToSample(sampleText) : draft.sample,
    };
    onSave(finalBook);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="dash-card p-6 md:p-8"
    >
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">
          {isEdit ? "本を編集" : "本を追加"}
        </h2>
        <button onClick={onCancel} className="text-[14px] font-semibold text-[#9a8362]">
          閉じる ✕
        </button>
      </div>

      <div className="grid gap-7 lg:grid-cols-[1fr_260px]">
        {/* ---- Fields ---- */}
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="タイトル">
              <input
                className="dash-field"
                value={draft.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="夜明けの図書館"
              />
            </Field>
            <Field label="著者">
              <input
                className="dash-field"
                value={draft.author}
                onChange={(e) => set("author", e.target.value)}
                placeholder="森野 詩"
              />
            </Field>
          </div>

          <Field label="紹介文">
            <textarea
              className="dash-field min-h-24 resize-y"
              value={draft.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="本の魅力を、お客様に伝える紹介文を書きます。"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="価格（円）">
              <input
                type="number"
                className="dash-field"
                value={draft.price.amount}
                onChange={(e) =>
                  set("price", { ...draft.price, amount: Number(e.target.value) || 0 })
                }
              />
            </Field>
            <Field label="ページ数">
              <input
                type="number"
                className="dash-field"
                value={draft.pageCount}
                onChange={(e) => set("pageCount", Number(e.target.value) || 0)}
              />
            </Field>
            <Field label="表示する本棚">
              <select
                className="dash-field"
                value={draft.category}
                onChange={(e) => set("category", e.target.value as ShelfCategory)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <fieldset className="rounded-xl border border-[#e6dcc6] bg-white/40 p-4">
            <legend className="px-2 text-[13px] font-bold text-[#7a5e3c]">判型・厚み</legend>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="幅（mm）">
                <input
                  type="number"
                  className="dash-field"
                  value={draft.dimensions.widthMm}
                  onChange={(e) => setDim("widthMm", Number(e.target.value) || 0)}
                />
              </Field>
              <Field label="高さ（mm）">
                <input
                  type="number"
                  className="dash-field"
                  value={draft.dimensions.heightMm}
                  onChange={(e) => setDim("heightMm", Number(e.target.value) || 0)}
                />
              </Field>
              <Field label="厚み（mm）">
                <input
                  type="number"
                  className="dash-field"
                  value={draft.dimensions.thicknessMm}
                  onChange={(e) => setDim("thicknessMm", Number(e.target.value) || 0)}
                />
              </Field>
            </div>
          </fieldset>

          <Field
            label="表紙画像URL"
            hint="画像を入れない場合は、右のように色味で表紙を自動生成します。"
          >
            <input
              className="dash-field"
              value={draft.coverImage ?? ""}
              onChange={(e) => set("coverImage", e.target.value)}
              placeholder="https://… / 空欄でもOK"
            />
          </Field>
          <Field label="背表紙画像URL" hint="本棚に並んだときの背表紙の画像です。">
            <input
              className="dash-field"
              value={draft.spineImage ?? ""}
              onChange={(e) => set("spineImage", e.target.value)}
              placeholder="https://… / 空欄でもOK"
            />
          </Field>

          {!draft.coverImage && (
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="背表紙の色">
                <input
                  type="color"
                  className="h-11 w-full cursor-pointer rounded-xl border border-[#e0d3b8] bg-white"
                  value={draft.spine.color}
                  onChange={(e) =>
                    set("spine", { ...draft.spine, color: e.target.value })
                  }
                />
              </Field>
              <Field label="濃い影の色">
                <input
                  type="color"
                  className="h-11 w-full cursor-pointer rounded-xl border border-[#e0d3b8] bg-white"
                  value={draft.spine.accent}
                  onChange={(e) =>
                    set("spine", { ...draft.spine, accent: e.target.value })
                  }
                />
              </Field>
              <Field label="文字の色">
                <input
                  type="color"
                  className="h-11 w-full cursor-pointer rounded-xl border border-[#e0d3b8] bg-white"
                  value={draft.spine.textColor}
                  onChange={(e) =>
                    set("spine", { ...draft.spine, textColor: e.target.value })
                  }
                />
              </Field>
            </div>
          )}

          <Field label="試し読みページ" hint="1行が1ページになります。空欄でもかまいません。">
            <textarea
              className="dash-field min-h-24 resize-y"
              value={sampleText}
              onChange={(e) => setSampleText(e.target.value)}
              placeholder={"物語の最初の一文を入力します。\n改行すると次のページになります。"}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="表示サイズ">
              <div className="flex gap-2">
                {SIZES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => set("displaySize", s.value)}
                    className={`flex-1 rounded-xl border px-3 py-2.5 text-[14px] font-semibold transition-colors ${
                      draft.displaySize === s.value
                        ? "border-[#c98a3c] bg-[#fbeed3] text-[#7a4e16]"
                        : "border-[#e0d3b8] bg-white/60 text-[#7a6a4a]"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="おすすめ表示">
              <button
                type="button"
                onClick={() => set("featured", !draft.featured)}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-[14px] font-semibold transition-colors ${
                  draft.featured
                    ? "border-[#c98a3c] bg-[#fbeed3] text-[#7a4e16]"
                    : "border-[#e0d3b8] bg-white/60 text-[#7a6a4a]"
                }`}
              >
                <span>{draft.featured ? "おすすめに表示中" : "おすすめにしない"}</span>
                <span
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    draft.featured ? "bg-[#c98a3c]" : "bg-[#d8c9a8]"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                      draft.featured ? "left-[22px]" : "left-0.5"
                    }`}
                  />
                </span>
              </button>
            </Field>
          </div>

          {shelves.length > 0 && (
            <Field label="この本を並べる棚" hint="複数の棚に並べられます。">
              <div className="flex flex-wrap gap-2">
                {shelves.map((s) => {
                  const on = (draft.shelfIds ?? []).includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() =>
                        set(
                          "shelfIds",
                          on
                            ? (draft.shelfIds ?? []).filter((id) => id !== s.id)
                            : [...(draft.shelfIds ?? []), s.id],
                        )
                      }
                      className={`rounded-full border px-4 py-2 text-[13.5px] font-semibold transition-colors ${
                        on
                          ? "border-[#5a7a4f] bg-[#e7f0e0] text-[#3c5a32]"
                          : "border-[#e0d3b8] bg-white/60 text-[#7a6a4a]"
                      }`}
                    >
                      {on ? "✓ " : ""}
                      {s.title}
                    </button>
                  );
                })}
              </div>
            </Field>
          )}
        </div>

        {/* ---- Live preview ---- */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <p className="dash-label">プレビュー</p>
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-[#e6dcc6] bg-gradient-to-b from-[#241a12] to-[#13100b] px-6 py-8">
            <BookCover book={previewBook} width={170} />
            <p className="text-center font-display text-[15px] font-bold text-[#f0e3c9]">
              {previewBook.title}
            </p>
            <p className="-mt-2 text-[12.5px] text-[#c9b48c]">{previewBook.author}</p>
          </div>
          <p className="mt-3 text-center text-[12px] leading-relaxed text-[#a08a66]">
            お客様に見える表紙のイメージです。
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button onClick={handleSave} disabled={!canSave} className="dash-btn-primary">
          {isEdit ? "保存する" : "本を追加する"}
        </button>
        <button onClick={onCancel} className="dash-btn-ghost">
          キャンセル
        </button>
        {!canSave && (
          <span className="self-center text-[13px] text-[#b08a5a]">
            タイトルと著者を入力してください
          </span>
        )}
      </div>
    </motion.div>
  );
}
