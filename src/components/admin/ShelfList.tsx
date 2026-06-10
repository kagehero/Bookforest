"use client";

import { motion } from "framer-motion";
import type { Shelf, ShelfKind } from "@/types/book";
import { EmptyState } from "./ui";

interface ShelfListProps {
  shelves: Shelf[];
  onAdd: () => void;
  onEdit: (shelf: Shelf) => void;
  onDelete: (shelf: Shelf) => void;
}

const KIND_LABEL: Record<ShelfKind, string> = {
  recommended: "おすすめ棚",
  new: "新着棚",
  seasonal: "季節棚",
  custom: "特集棚",
};
const KIND_TONE: Record<ShelfKind, string> = {
  recommended: "bg-[#e7f0e0] text-[#3c5a32]",
  new: "bg-[#e2ecf5] text-[#2f5275]",
  seasonal: "bg-[#fbeed3] text-[#a86f2c]",
  custom: "bg-[#f0e2ef] text-[#6a3a64]",
};

export function ShelfList({ shelves, onAdd, onEdit, onDelete }: ShelfListProps) {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">本棚管理</h1>
          <p className="mt-1 text-[14px] text-[#8a7458]">
            作成されている棚：{shelves.length} 棚
          </p>
        </div>
        <button onClick={onAdd} className="dash-btn-primary">
          ＋ 棚を追加
        </button>
      </div>

      {shelves.length === 0 ? (
        <EmptyState
          icon="🗄️"
          title="まだ棚がありません"
          body="「棚を追加」から、おすすめ棚や特集棚をつくれます。"
          action={
            <button onClick={onAdd} className="dash-btn-primary">
              ＋ 棚を追加
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {shelves.map((shelf) => {
            const kind = shelf.kind ?? "custom";
            return (
              <motion.div
                key={shelf.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="dash-card flex flex-col p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-display text-[18px] font-bold">
                        {shelf.title}
                      </h3>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${KIND_TONE[kind]}`}
                      >
                        {KIND_LABEL[kind]}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[13.5px] text-[#8a7458]">
                      {shelf.description || shelf.subtitle}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-lg bg-[#f0e6d2] px-2.5 py-1 text-center">
                    <span className="block font-display text-[18px] font-bold text-[#6a523a]">
                      {shelf.bookIds.length}
                    </span>
                    <span className="block text-[10px] text-[#9a8362]">冊</span>
                  </span>
                </div>

                <p className="mt-3 text-[12px] text-[#9a8362]">
                  表示順：{shelf.displayOrder ?? "—"}
                </p>

                <div className="mt-4 flex gap-2 border-t border-[#ece2cd] pt-3">
                  <button
                    onClick={() => onEdit(shelf)}
                    className="flex-1 rounded-lg bg-white/70 py-2 text-[14px] font-semibold text-[#6a523a] transition-colors hover:bg-white"
                  >
                    ✎ 編集・並び替え
                  </button>
                  <button
                    onClick={() => onDelete(shelf)}
                    className="rounded-lg px-4 py-2 text-[14px] font-semibold text-[#a14b32] transition-colors hover:bg-[#fbeee9]"
                  >
                    削除
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
