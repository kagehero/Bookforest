import { MockBookRepository } from "./mockRepository";
import { LocalStorageBookRepository } from "./localStorageRepository";
import type { AdminBookRepository, BookRepository } from "./types";

export type { BookRepository, AdminBookRepository } from "./types";
export type { NewBookInput, NewShelfInput } from "./types";

/**
 * Composition root for data access. Swap this single factory to point the whole
 * app at Shopify:
 *
 *   return new ShopifyBookRepository({
 *     domain: process.env.SHOPIFY_STORE_DOMAIN!,
 *     token: process.env.SHOPIFY_STOREFRONT_TOKEN!,
 *   });
 *
 * Nothing in the UI imports a concrete repository — only `getBookRepository()`.
 *
 * For this prototype we use a `localStorage`-backed repository in the browser so
 * that edits made in `/admin` persist and appear on the public bookshelf. During
 * server rendering (no `window`) we fall back to the read-only in-memory mock,
 * which yields the same curated catalogue the localStorage repo seeds from.
 */
let singleton: BookRepository | null = null;

export function getBookRepository(): BookRepository {
  if (typeof window === "undefined") {
    // Per-request on the server; never cache across requests.
    return new MockBookRepository();
  }
  if (!singleton) {
    singleton = new LocalStorageBookRepository();
  }
  return singleton;
}

/**
 * The admin needs the richer write surface. Only meaningful in the browser; the
 * `/admin` route is a client component, so `window` is always present here.
 */
export function getAdminRepository(): AdminBookRepository {
  return getBookRepository() as AdminBookRepository;
}
