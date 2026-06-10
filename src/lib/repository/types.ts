import type { Book, Shelf } from "@/types/book";

/**
 * The repository contract the UI depends on. Today it is fulfilled by an
 * in-memory mock (`MockBookRepository`). Tomorrow a `ShopifyBookRepository`
 * implementing the same interface can be dropped in with zero UI changes —
 * this is the seam that keeps Shopify integration a configuration concern.
 *
 * Read methods are async on purpose so a network-backed implementation needs
 * no signature changes. Write methods model the admin simulation and would,
 * in production, map to Shopify Admin API mutations / metafield updates.
 */
export interface BookRepository {
  // ---- Reads ----
  getShelves(): Promise<Shelf[]>;
  getShelf(id: string): Promise<Shelf | undefined>;
  getBooks(): Promise<Book[]>;
  getBook(id: string): Promise<Book | undefined>;
  getBooksForShelf(shelfId: string): Promise<Book[]>;

  // ---- Writes (admin simulation) ----
  addBook(input: NewBookInput): Promise<Book>;
  createShelf(input: NewShelfInput): Promise<Shelf>;
  /** Replace a shelf's ordered book ids (drag-to-reorder / move). */
  setShelfOrder(shelfId: string, bookIds: string[]): Promise<Shelf>;
  /** Move a single book to a position within (or into) a shelf. */
  moveBook(bookId: string, toShelfId: string, toIndex: number): Promise<void>;
}

export interface NewBookInput {
  title: string;
  author: string;
  description?: string;
  priceAmount: number;
  category: Book["category"];
  /** Optional spine colour; a pleasant default is chosen if omitted. */
  spineColor?: string;
}

export interface NewShelfInput {
  title: string;
  subtitle?: string;
  category: Book["category"];
}

/**
 * The richer admin contract. The dashboard persists whole `Book` / `Shelf`
 * records (it edits every field), so it talks to the repository through these
 * methods rather than the lightweight `add*`/`create*` helpers above.
 */
export interface AdminBookRepository extends BookRepository {
  /** Insert or replace a book by id, returning the saved record. */
  upsertBook(book: Book): Promise<Book>;
  /** Remove a book and detach it from every shelf. */
  deleteBook(bookId: string): Promise<void>;
  /** Insert or replace a shelf by id, returning the saved record. */
  upsertShelf(shelf: Shelf): Promise<Shelf>;
  /** Remove a shelf (books are kept; only the grouping is removed). */
  deleteShelf(shelfId: string): Promise<void>;
  /** Reset storage to the curated demo catalogue. */
  resetDemoData(): Promise<void>;
}
