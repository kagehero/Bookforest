"use client";

import { motion } from "framer-motion";
import type { Book, Shelf } from "@/types/book";
import { formatPrice } from "@/lib/format";
import { EmptyState } from "./ui";

interface BookListProps {
  books: Book[];
  shelves: Shelf[];
  onAdd: () => void;
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
}

const SIZE_LABEL: Record<string, string> = {
  small: "小さめ",
  medium: "ふつう",
  large: "大きめ",
};

/** A small visual swatch of a book's spine — image if set, else its colours. */
function SpineThumb({ book }: { book: Book }) {
  if (book.spineImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={book.spineImage}
        alt=""
        className="h-16 w-5 rounded-sm object-cover shadow"
      />
    );
  }
  return (
    <span
      className="flex h-16 w-5 items-center justify-center rounded-sm shadow"
      style={{
        background: `linear-gradient(95deg, ${book.spine.color} 0%, ${book.spine.color} 62%, ${book.spine.accent} 100%)`,
      }}
    >
      {book.spine.band && (
        <span className="h-[2px] w-full" style={{ background: book.spine.band }} />
      )}
    </span>
  );
}

function CoverThumb({ book }: { book: Book }) {
  if (book.coverImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={book.coverImage}
        alt=""
        className="h-16 w-11 rounded-md object-cover shadow"
      />
    );
  }
  return (
    <span
      className="flex h-16 w-11 items-center justify-center rounded-md p-1 text-center shadow"
      style={{ background: book.cover.background, color: book.cover.textColor }}
    >
      <span className="line-clamp-3 text-[8px] font-bold leading-tight">
        {book.title}
      </span>
    </span>
  );
}

export function BookList({ books, shelves, onAdd, onEdit, onDelete }: BookListProps) {
  const shelfTitle = (id: string) => shelves.find((s) => s.id === id)?.title;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">商品管理</h1>
          <p className="mt-1 text-[14px] text-[#8a7458]">
            登録されている本：{books.length} 冊
          </p>
        </div>
        <button onClick={onAdd} className="dash-btn-primary">
          ＋ 本を追加
        </button>
      </div>

      {books.length === 0 ? (
        <EmptyState
          icon="📖"
          title="まだ本がありません"
          body="「本を追加」から、最初の一冊を登録してみましょう。"
          action={
            <button onClick={onAdd} className="dash-btn-primary">
              ＋ 本を追加
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {books.map((book) => (
            <motion.div
              key={book.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="dash-card flex flex-col p-4"
            >
              <div className="flex gap-3">
                <div className="flex shrink-0 items-end gap-1.5">
                  <CoverThumb book={book} />
                  <SpineThumb book={book} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-1.5">
                    <h3 className="line-clamp-2 font-display text-[16px] font-bold leading-tight">
                      {book.title}
                    </h3>
                    {book.featured && (
                      <span className="shrink-0 rounded-full bg-[#fbeed3] px-2 py-0.5 text-[10px] font-bold text-[#a86f2c]">
                        おすすめ
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[13px] text-[#8a7458]">{book.author}</p>
                  <p className="mt-1.5 font-display text-[15px] font-bold text-[#a86f2c]">
                    {formatPrice(book.price)}
                  </p>
                  <p className="mt-0.5 text-[12px] text-[#9a8362]">
                    {book.pageCount}ページ ・ 表示：{SIZE_LABEL[book.displaySize ?? "medium"]}
                  </p>
                </div>
              </div>

              {(book.shelfIds ?? []).length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(book.shelfIds ?? []).map((id) => (
                    <span
                      key={id}
                      className="rounded-full bg-[#eee4cf] px-2.5 py-1 text-[11.5px] font-semibold text-[#6a523a]"
                    >
                      {shelfTitle(id) ?? "（不明な棚）"}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-4 flex gap-2 border-t border-[#ece2cd] pt-3">
                <button
                  onClick={() => onEdit(book)}
                  className="flex-1 rounded-lg bg-white/70 py-2 text-[14px] font-semibold text-[#6a523a] transition-colors hover:bg-white"
                >
                  ✎ 編集
                </button>
                <button
                  onClick={() => onDelete(book)}
                  className="rounded-lg px-4 py-2 text-[14px] font-semibold text-[#a14b32] transition-colors hover:bg-[#fbeee9]"
                >
                  削除
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
