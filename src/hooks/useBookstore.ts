"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Book, Shelf } from "@/types/book";
import {
  getBookRepository,
  type NewBookInput,
  type NewShelfInput,
} from "@/lib/repository";

/**
 * Single source of truth for shelves + books on the client. Wraps the
 * repository so components never import a concrete data source, and exposes the
 * admin mutations the simulation needs. Reloads from the repository after every
 * write so the UI always reflects authoritative state.
 */
export function useBookstore() {
  const repo = useMemo(() => getBookRepository(), []);
  const [shelves, setShelves] = useState<Shelf[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [s, b] = await Promise.all([repo.getShelves(), repo.getBooks()]);
    setShelves(s);
    setBooks(b);
  }, [repo]);

  useEffect(() => {
    let active = true;
    (async () => {
      const [s, b] = await Promise.all([repo.getShelves(), repo.getBooks()]);
      if (!active) return;
      setShelves(s);
      setBooks(b);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [repo]);

  const booksById = useMemo(
    () => new Map(books.map((b) => [b.id, b])),
    [books],
  );

  const getBooksForShelf = useCallback(
    (shelf: Shelf): Book[] =>
      shelf.bookIds
        .map((id) => booksById.get(id))
        .filter((b): b is Book => Boolean(b)),
    [booksById],
  );

  // ---- Admin mutations ----
  const addBook = useCallback(
    async (input: NewBookInput) => {
      await repo.addBook(input);
      await refresh();
    },
    [repo, refresh],
  );

  const createShelf = useCallback(
    async (input: NewShelfInput) => {
      await repo.createShelf(input);
      await refresh();
    },
    [repo, refresh],
  );

  const setShelfOrder = useCallback(
    async (shelfId: string, bookIds: string[]) => {
      // Optimistic update for snappy drag-reordering.
      setShelves((prev) =>
        prev.map((s) => (s.id === shelfId ? { ...s, bookIds } : s)),
      );
      await repo.setShelfOrder(shelfId, bookIds);
    },
    [repo],
  );

  const moveBook = useCallback(
    async (bookId: string, toShelfId: string, toIndex: number) => {
      await repo.moveBook(bookId, toShelfId, toIndex);
      await refresh();
    },
    [repo, refresh],
  );

  return {
    shelves,
    books,
    booksById,
    loading,
    getBooksForShelf,
    addBook,
    createShelf,
    setShelfOrder,
    moveBook,
    refresh,
  };
}
