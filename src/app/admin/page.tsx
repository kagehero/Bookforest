"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Book, Shelf } from "@/types/book";
import { getAdminRepository } from "@/lib/repository";
import { AdminLayout, type AdminSection } from "@/components/admin/AdminLayout";
import { Dashboard } from "@/components/admin/Dashboard";
import { BookList } from "@/components/admin/BookList";
import { BookForm } from "@/components/admin/BookForm";
import { ShelfList } from "@/components/admin/ShelfList";
import { ShelfForm } from "@/components/admin/ShelfForm";
import { AdminPreview } from "@/components/admin/AdminPreview";
import { ConfirmDialog, Toast } from "@/components/admin/ui";

/** Generate the next sequential book id, e.g. "book-042". */
function nextBookId(books: Book[]): string {
  let max = 0;
  for (const b of books) {
    const m = /^book-(\d+)$/.exec(b.id);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return `book-${String(max + 1).padStart(3, "0")}`;
}

type Editing<T> = { mode: "closed" } | { mode: "new" } | { mode: "edit"; value: T };

/**
 * The store-owner dashboard. A single client page that loads the catalogue from
 * the localStorage-backed repository, edits it through forms, and persists every
 * change — so edits also show up on the public bookshelf at `/`.
 */
export default function AdminPage() {
  const repo = getAdminRepository();

  const [section, setSection] = useState<AdminSection>("dashboard");
  const [books, setBooks] = useState<Book[]>([]);
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [bookEdit, setBookEdit] = useState<Editing<Book>>({ mode: "closed" });
  const [shelfEdit, setShelfEdit] = useState<Editing<Shelf>>({ mode: "closed" });
  const [confirm, setConfirm] = useState<
    | { kind: "book"; target: Book }
    | { kind: "shelf"; target: Shelf }
    | { kind: "reset" }
    | null
  >(null);

  const reload = useCallback(async () => {
    const [b, s] = await Promise.all([repo.getBooks(), repo.getShelves()]);
    setBooks(b);
    setShelves(s);
  }, [repo]);

  useEffect(() => {
    (async () => {
      await reload();
      setReady(true);
    })();
  }, [reload]);

  // ---- Book actions ----
  const saveBook = async (book: Book) => {
    const isNew = !book.id;
    const finalBook: Book = isNew ? { ...book, id: nextBookId(books) } : book;
    await repo.upsertBook(finalBook);
    await reload();
    setBookEdit({ mode: "closed" });
    setToast(isNew ? "本を追加しました" : "保存しました");
  };

  const deleteBook = async (book: Book) => {
    await repo.deleteBook(book.id);
    await reload();
    setConfirm(null);
    setToast("削除しました");
  };

  // ---- Shelf actions ----
  const saveShelf = async (shelf: Shelf) => {
    const isNew = !shelf.id;
    const finalShelf: Shelf = isNew
      ? { ...shelf, id: `shelf-${Date.now()}` }
      : shelf;
    await repo.upsertShelf(finalShelf);
    await reload();
    setShelfEdit({ mode: "closed" });
    setToast(isNew ? "棚を追加しました" : "棚を更新しました");
  };

  const deleteShelf = async (shelf: Shelf) => {
    await repo.deleteShelf(shelf.id);
    await reload();
    setConfirm(null);
    setToast("削除しました");
  };

  const doReset = async () => {
    await repo.resetDemoData();
    await reload();
    setConfirm(null);
    setBookEdit({ mode: "closed" });
    setShelfEdit({ mode: "closed" });
    setToast("デモ内容をリセットしました");
  };

  const editingBook = bookEdit.mode === "edit" ? bookEdit.value : null;
  const editingShelf = shelfEdit.mode === "edit" ? shelfEdit.value : null;
  const bookFormOpen = bookEdit.mode !== "closed";
  const shelfFormOpen = shelfEdit.mode !== "closed";

  return (
    <AdminLayout
      active={section}
      onNavigate={(s) => {
        setSection(s);
        setBookEdit({ mode: "closed" });
        setShelfEdit({ mode: "closed" });
      }}
      onReset={() => setConfirm({ kind: "reset" })}
    >
      {!ready ? (
        <div className="flex h-[50vh] items-center justify-center text-[15px] text-[#9a8362]">
          読み込んでいます…
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={section + (bookFormOpen ? "-bf" : "") + (shelfFormOpen ? "-sf" : "")}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {section === "dashboard" && (
              <Dashboard books={books} shelves={shelves} onNavigate={setSection} />
            )}

            {section === "books" &&
              (bookFormOpen ? (
                <BookForm
                  book={editingBook}
                  shelves={shelves}
                  onSave={saveBook}
                  onCancel={() => setBookEdit({ mode: "closed" })}
                />
              ) : (
                <BookList
                  books={books}
                  shelves={shelves}
                  onAdd={() => setBookEdit({ mode: "new" })}
                  onEdit={(b) => setBookEdit({ mode: "edit", value: b })}
                  onDelete={(b) => setConfirm({ kind: "book", target: b })}
                />
              ))}

            {section === "shelves" &&
              (shelfFormOpen ? (
                <ShelfForm
                  shelf={editingShelf}
                  books={books}
                  onSave={saveShelf}
                  onCancel={() => setShelfEdit({ mode: "closed" })}
                />
              ) : (
                <ShelfList
                  shelves={shelves}
                  onAdd={() => setShelfEdit({ mode: "new" })}
                  onEdit={(s) => setShelfEdit({ mode: "edit", value: s })}
                  onDelete={(s) => setConfirm({ kind: "shelf", target: s })}
                />
              ))}

            {section === "preview" && (
              <AdminPreview books={books} shelves={shelves} />
            )}
          </motion.div>
        </AnimatePresence>
      )}

      <ConfirmDialog
        open={confirm?.kind === "book"}
        title="この本を削除しますか？"
        body={
          confirm?.kind === "book"
            ? `「${confirm.target.title}」を本棚から取り除きます。この操作は元に戻せません。`
            : ""
        }
        onConfirm={() => confirm?.kind === "book" && deleteBook(confirm.target)}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm?.kind === "shelf"}
        title="この棚を削除しますか？"
        body={
          confirm?.kind === "shelf"
            ? `「${confirm.target.title}」を削除します。棚に並んでいた本は残ります。`
            : ""
        }
        onConfirm={() => confirm?.kind === "shelf" && deleteShelf(confirm.target)}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm?.kind === "reset"}
        title="デモ内容をリセットしますか？"
        body="追加・編集した内容をすべて消して、最初のサンプルに戻します。"
        confirmLabel="リセットする"
        onConfirm={doReset}
        onCancel={() => setConfirm(null)}
      />

      <Toast message={toast} onDone={() => setToast(null)} />
    </AdminLayout>
  );
}
