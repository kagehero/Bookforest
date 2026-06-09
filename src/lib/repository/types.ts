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
