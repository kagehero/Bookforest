import type { Book, Shelf } from "@/types/book";
import {
  getBooks,
  getShelves,
  saveBooks,
  saveShelves,
  resetDemoData as resetStorage,
  kindFromCategory,
} from "@/lib/adminStorage";
import type {
  AdminBookRepository,
  NewBookInput,
  NewShelfInput,
} from "./types";

const SPINE_PRESETS: Array<Book["spine"]> = [
  { color: "#2f4a36", accent: "#1d3327", textColor: "#e8dcc0", band: "#c9a24b" },
  { color: "#7a5638", accent: "#2a1c12", textColor: "#ffe7b8", band: "#e08a3c" },
  { color: "#1d3327", accent: "#0c1410", textColor: "#c9a24b", band: "#7c9b7e" },
  { color: "#a07a4f", accent: "#5a3f28", textColor: "#3a3026", band: "#d8c9a8" },
];

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "")
      .slice(0, 40) || `book-${Date.now()}`
  );
}

function nextBookId(books: Book[]): string {
  let max = 0;
  for (const b of books) {
    const m = /^book-(\d+)$/.exec(b.id);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return `book-${String(max + 1).padStart(3, "0")}`;
}

/**
 * A `BookRepository` backed by `localStorage` (via `adminStorage`). This is the
 * seam that makes the prototype convincing: the admin writes here, and the
 * public bookshelf reads here, so changes are immediately reflected end-to-end.
 *
 * Reads stay async to match the interface (a future Shopify adapter is async).
 */
export class LocalStorageBookRepository implements AdminBookRepository {
  // ---- Reads ----
  async getShelves(): Promise<Shelf[]> {
    return getShelves();
  }

  async getShelf(id: string): Promise<Shelf | undefined> {
    return getShelves().find((s) => s.id === id);
  }

  async getBooks(): Promise<Book[]> {
    return getBooks();
  }

  async getBook(id: string): Promise<Book | undefined> {
    return getBooks().find((b) => b.id === id);
  }

  async getBooksForShelf(shelfId: string): Promise<Book[]> {
    const shelf = getShelves().find((s) => s.id === shelfId);
    if (!shelf) return [];
    const byId = new Map(getBooks().map((b) => [b.id, b]));
    return shelf.bookIds
      .map((id) => byId.get(id))
      .filter((b): b is Book => Boolean(b));
  }

  // ---- Lightweight writes (kept for the legacy in-shelf admin panel) ----
  async addBook(input: NewBookInput): Promise<Book> {
    const books = getBooks();
    const preset = SPINE_PRESETS[books.length % SPINE_PRESETS.length];
    const spine = input.spineColor
      ? { ...preset, color: input.spineColor }
      : preset;
    const book: Book = {
      id: nextBookId(books),
      handle: slugify(input.title),
      title: input.title,
      author: input.author,
      description:
        input.description?.trim() ||
        "店主によって、今まさに本棚へ並べられたばかりの一冊。",
      spine,
      cover: {
        background: `linear-gradient(160deg,${spine.color},${spine.accent})`,
        textColor: spine.textColor,
        tagline: "森に新しく芽吹いた物語。",
      },
      dimensions: { heightMm: 184, widthMm: 124, thicknessMm: 18 },
      pageCount: 240,
      price: { amount: input.priceAmount, currencyCode: "JPY" },
      category: input.category,
      featured: false,
      displaySize: "medium",
      shelfIds: [],
      sample: [
        {
          pageNumber: 1,
          heading: "第一章",
          paragraphs: [
            "物語は、まだ書かれはじめたばかりだ。",
            "けれど、最初の一文がそこにある限り、続きはきっと生まれてくる。",
          ],
        },
      ],
    };
    const shelves = getShelves();
    const shelf = shelves.find((s) => s.category === input.category);
    if (shelf) {
      shelf.bookIds.push(book.id);
      book.shelfIds = [shelf.id];
      saveShelves(shelves);
    }
    saveBooks([...books, book]);
    return book;
  }

  async createShelf(input: NewShelfInput): Promise<Shelf> {
    const shelves = getShelves();
    const shelf: Shelf = {
      id: `shelf-${Date.now()}`,
      category: input.category,
      title: input.title,
      subtitle: input.subtitle?.trim() || "店主が新しく設えた本棚",
      bookIds: [],
      description: input.subtitle?.trim() || "",
      kind: kindFromCategory(input.category),
      displayOrder: shelves.length + 1,
    };
    saveShelves([...shelves, shelf]);
    return shelf;
  }

  async setShelfOrder(shelfId: string, bookIds: string[]): Promise<Shelf> {
    const shelves = getShelves();
    const shelf = shelves.find((s) => s.id === shelfId);
    if (!shelf) throw new Error(`Shelf not found: ${shelfId}`);
    const valid = new Set(getBooks().map((b) => b.id));
    shelf.bookIds = bookIds.filter((id) => valid.has(id));
    saveShelves(shelves);
    return shelf;
  }

  async moveBook(bookId: string, toShelfId: string, toIndex: number): Promise<void> {
    const shelves = getShelves();
    for (const s of shelves) {
      const idx = s.bookIds.indexOf(bookId);
      if (idx >= 0) s.bookIds.splice(idx, 1);
    }
    const target = shelves.find((s) => s.id === toShelfId);
    if (!target) throw new Error(`Shelf not found: ${toShelfId}`);
    const clamped = Math.max(0, Math.min(toIndex, target.bookIds.length));
    target.bookIds.splice(clamped, 0, bookId);
    saveShelves(shelves);
    this.syncBookShelfRefs();
  }

  // ---- Rich admin writes ----
  async upsertBook(book: Book): Promise<Book> {
    const books = getBooks();
    const idx = books.findIndex((b) => b.id === book.id);
    if (idx >= 0) books[idx] = book;
    else books.push(book);

    // Reconcile shelf membership from the book's shelfIds.
    const shelves = getShelves();
    const targetShelves = new Set(book.shelfIds ?? []);
    for (const shelf of shelves) {
      const has = shelf.bookIds.includes(book.id);
      const should = targetShelves.has(shelf.id);
      if (should && !has) shelf.bookIds.push(book.id);
      else if (!should && has)
        shelf.bookIds = shelf.bookIds.filter((id) => id !== book.id);
    }
    saveShelves(shelves);
    saveBooks(books);
    return book;
  }

  async deleteBook(bookId: string): Promise<void> {
    saveBooks(getBooks().filter((b) => b.id !== bookId));
    const shelves = getShelves();
    for (const s of shelves) {
      s.bookIds = s.bookIds.filter((id) => id !== bookId);
    }
    saveShelves(shelves);
  }

  async upsertShelf(shelf: Shelf): Promise<Shelf> {
    const shelves = getShelves();
    const idx = shelves.findIndex((s) => s.id === shelf.id);
    // Keep only ids that point at real books.
    const valid = new Set(getBooks().map((b) => b.id));
    shelf.bookIds = shelf.bookIds.filter((id) => valid.has(id));
    if (idx >= 0) shelves[idx] = shelf;
    else shelves.push(shelf);
    saveShelves(shelves);
    this.syncBookShelfRefs();
    return shelf;
  }

  async deleteShelf(shelfId: string): Promise<void> {
    saveShelves(getShelves().filter((s) => s.id !== shelfId));
    this.syncBookShelfRefs();
  }

  async resetDemoData(): Promise<void> {
    resetStorage();
  }

  /** Recompute every book's `shelfIds` from authoritative shelf membership. */
  private syncBookShelfRefs(): void {
    const shelves = getShelves();
    const refs = new Map<string, string[]>();
    for (const shelf of shelves) {
      for (const id of shelf.bookIds) {
        const arr = refs.get(id) ?? [];
        arr.push(shelf.id);
        refs.set(id, arr);
      }
    }
    const books = getBooks().map((b) => ({ ...b, shelfIds: refs.get(b.id) ?? [] }));
    saveBooks(books);
  }
}
