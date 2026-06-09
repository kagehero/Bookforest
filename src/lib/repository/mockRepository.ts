import type { Book, Shelf } from "@/types/book";
import { MOCK_BOOKS } from "@/lib/data/books";
import { MOCK_SHELVES } from "@/lib/data/shelves";
import type {
  BookRepository,
  NewBookInput,
  NewShelfInput,
} from "./types";

/** Simulated network latency so loading states feel real in the prototype. */
function delay<T>(value: T, ms = 220): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

const SPINE_PRESETS: Array<Book["spine"]> = [
  { color: "#2f4a36", accent: "#1d3327", textColor: "#e8dcc0", band: "#c9a24b" },
  { color: "#7a5638", accent: "#2a1c12", textColor: "#ffe7b8", band: "#e08a3c" },
  { color: "#1d3327", accent: "#0c1410", textColor: "#c9a24b", band: "#7c9b7e" },
  { color: "#a07a4f", accent: "#5a3f28", textColor: "#3a3026", band: "#d8c9a8" },
];

/**
 * In-memory implementation. State is mutable so the admin simulation can add,
 * reorder and move books within a session. It is intentionally NOT persisted —
 * a refresh restores the curated catalogue.
 */
export class MockBookRepository implements BookRepository {
  private books: Book[];
  private shelves: Shelf[];
  private counter: number;

  constructor() {
    // Deep-ish copy so mutations never leak back into the source modules.
    this.books = MOCK_BOOKS.map((b) => ({ ...b }));
    this.shelves = MOCK_SHELVES.map((s) => ({ ...s, bookIds: [...s.bookIds] }));
    this.counter = this.books.length;
  }

  async getShelves(): Promise<Shelf[]> {
    return delay(this.shelves.map((s) => ({ ...s, bookIds: [...s.bookIds] })));
  }

  async getShelf(id: string): Promise<Shelf | undefined> {
    const s = this.shelves.find((x) => x.id === id);
    return delay(s ? { ...s, bookIds: [...s.bookIds] } : undefined);
  }

  async getBooks(): Promise<Book[]> {
    return delay(this.books.map((b) => ({ ...b })));
  }

  async getBook(id: string): Promise<Book | undefined> {
    const b = this.books.find((x) => x.id === id);
    return delay(b ? { ...b } : undefined);
  }

  async getBooksForShelf(shelfId: string): Promise<Book[]> {
    const shelf = this.shelves.find((s) => s.id === shelfId);
    if (!shelf) return delay([]);
    const byId = new Map(this.books.map((b) => [b.id, b]));
    const ordered = shelf.bookIds
      .map((id) => byId.get(id))
      .filter((b): b is Book => Boolean(b))
      .map((b) => ({ ...b }));
    return delay(ordered);
  }

  async addBook(input: NewBookInput): Promise<Book> {
    this.counter += 1;
    const preset = SPINE_PRESETS[this.counter % SPINE_PRESETS.length];
    const spine = input.spineColor
      ? { ...preset, color: input.spineColor }
      : preset;

    const book: Book = {
      id: `book-${String(this.counter).padStart(3, "0")}`,
      handle: input.title.toLowerCase().replace(/\s+/g, "-").slice(0, 40) || `book-${this.counter}`,
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

    this.books.push(book);
    // Append to the first shelf matching the category, if any.
    const shelf = this.shelves.find((s) => s.category === input.category);
    if (shelf) shelf.bookIds.push(book.id);
    return delay(book, 120);
  }

  async createShelf(input: NewShelfInput): Promise<Shelf> {
    const shelf: Shelf = {
      id: `shelf-${Date.now()}`,
      category: input.category,
      title: input.title,
      subtitle: input.subtitle?.trim() || "店主が新しく設えた本棚",
      bookIds: [],
    };
    this.shelves.push(shelf);
    return delay(shelf, 120);
  }

  async setShelfOrder(shelfId: string, bookIds: string[]): Promise<Shelf> {
    const shelf = this.shelves.find((s) => s.id === shelfId);
    if (!shelf) throw new Error(`Shelf not found: ${shelfId}`);
    // Keep only ids that actually exist, preserving the requested order.
    const valid = new Set(this.books.map((b) => b.id));
    shelf.bookIds = bookIds.filter((id) => valid.has(id));
    return delay({ ...shelf, bookIds: [...shelf.bookIds] }, 80);
  }

  async moveBook(bookId: string, toShelfId: string, toIndex: number): Promise<void> {
    // Remove from any shelf currently holding it.
    for (const s of this.shelves) {
      const idx = s.bookIds.indexOf(bookId);
      if (idx >= 0) s.bookIds.splice(idx, 1);
    }
    const target = this.shelves.find((s) => s.id === toShelfId);
    if (!target) throw new Error(`Shelf not found: ${toShelfId}`);
    const clamped = Math.max(0, Math.min(toIndex, target.bookIds.length));
    target.bookIds.splice(clamped, 0, bookId);
    return delay(undefined, 60);
  }
}
