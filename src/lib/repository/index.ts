import { MockBookRepository } from "./mockRepository";
import type { BookRepository } from "./types";

export type { BookRepository } from "./types";
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
 */
let singleton: BookRepository | null = null;

export function getBookRepository(): BookRepository {
  if (!singleton) {
    singleton = new MockBookRepository();
  }
  return singleton;
}
