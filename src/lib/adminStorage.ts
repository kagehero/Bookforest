/**
 * localStorage-backed persistence for the prototype admin.
 *
 * In production these reads/writes become Shopify Admin API calls (products,
 * metafields, Metaobjects). Here they are plain `localStorage` so the demo is
 * fully self-contained: edits made in `/admin` survive refreshes AND show up on
 * the public bookshelf, because both read through this module.
 *
 * The shapes stored are exactly the domain `Book` / `Shelf` types, so nothing
 * downstream needs a mapping layer.
 */

import type { Book, Shelf, ShelfCategory, ShelfKind } from "@/types/book";
import { MOCK_BOOKS } from "@/lib/data/books";
import { MOCK_SHELVES } from "@/lib/data/shelves";

const BOOKS_KEY = "hnm.admin.books.v1";
const SHELVES_KEY = "hnm.admin.shelves.v1";

/** Notified whenever the catalogue changes, so open views can re-read. */
const CHANGE_EVENT = "hnm:catalogue-changed";

/** Map a shelf category to the friendly admin "kind" tag. */
function kindFromCategory(category: ShelfCategory): ShelfKind {
  switch (category) {
    case "recommended":
      return "recommended";
    case "new-arrivals":
      return "new";
    case "seasonal":
      return "seasonal";
    default:
      return "custom";
  }
}

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

/** Build the seed catalogue from the curated mocks, filling in admin fields. */
function buildSeed(): { books: Book[]; shelves: Shelf[] } {
  const shelves: Shelf[] = MOCK_SHELVES.map((s, i) => ({
    ...s,
    bookIds: [...s.bookIds],
    description: s.subtitle,
    kind: kindFromCategory(s.category),
    displayOrder: i + 1,
  }));

  // Back-reference each book to the shelves that contain it.
  const shelfIdsByBook = new Map<string, string[]>();
  for (const shelf of shelves) {
    for (const id of shelf.bookIds) {
      const arr = shelfIdsByBook.get(id) ?? [];
      arr.push(shelf.id);
      shelfIdsByBook.set(id, arr);
    }
  }

  const books: Book[] = MOCK_BOOKS.map((b) => ({
    ...b,
    displaySize: b.featured ? "large" : "medium",
    shelfIds: shelfIdsByBook.get(b.id) ?? [],
  }));

  return { books, shelves };
}

function readJSON<T>(key: string): T | null {
  if (!hasStorage()) return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJSON(key: string, value: unknown): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / privacy mode — ignore in a prototype */
  }
}

function emitChange(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }
}

/** Ensure storage is seeded on first load; returns the current catalogue. */
function ensureSeeded(): { books: Book[]; shelves: Shelf[] } {
  const books = readJSON<Book[]>(BOOKS_KEY);
  const shelves = readJSON<Shelf[]>(SHELVES_KEY);
  if (books && shelves) return { books, shelves };

  const seed = buildSeed();
  writeJSON(BOOKS_KEY, seed.books);
  writeJSON(SHELVES_KEY, seed.shelves);
  return seed;
}

/* --------------------------------- API ---------------------------------- */

/** All books, in storage order. Seeds demo data on first call. */
export function getBooks(): Book[] {
  if (!hasStorage()) return buildSeed().books;
  return ensureSeeded().books;
}

/** All shelves, sorted by their display order. Seeds demo data on first call. */
export function getShelves(): Shelf[] {
  if (!hasStorage()) return buildSeed().shelves;
  return [...ensureSeeded().shelves].sort(
    (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0),
  );
}

/** Persist the full book list, then notify listeners. */
export function saveBooks(books: Book[]): void {
  writeJSON(BOOKS_KEY, books);
  emitChange();
}

/** Persist the full shelf list, then notify listeners. */
export function saveShelves(shelves: Shelf[]): void {
  writeJSON(SHELVES_KEY, shelves);
  emitChange();
}

/** Wipe stored data and re-seed from the curated demo catalogue. */
export function resetDemoData(): { books: Book[]; shelves: Shelf[] } {
  const seed = buildSeed();
  writeJSON(BOOKS_KEY, seed.books);
  writeJSON(SHELVES_KEY, seed.shelves);
  emitChange();
  return seed;
}

/** Subscribe to catalogue changes (storage writes in this or another tab). */
export function onCatalogueChange(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const storageHandler = (e: StorageEvent) => {
    if (e.key === BOOKS_KEY || e.key === SHELVES_KEY) handler();
  };
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener("storage", storageHandler);
  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener("storage", storageHandler);
  };
}

export { kindFromCategory };
