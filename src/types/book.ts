/**
 * Domain types for 本の森 (Hon no Mori).
 *
 * These types are deliberately decoupled from any data source. The mock layer
 * and a future Shopify Storefront adapter both map *into* these shapes, so UI
 * components never know where a book came from. See `src/lib/repository`.
 */

export type ShelfCategory = "recommended" | "new-arrivals" | "seasonal";

/** A single sample page rendered in the reading view. */
export interface SamplePage {
  /** 1-based page number as printed in the book. */
  pageNumber: number;
  /** Paragraphs of body text. Each string is one paragraph. */
  paragraphs: string[];
  /** Optional chapter heading shown above the body on this page. */
  heading?: string;
}

/** Physical dimensions, used to size the spine realistically on the shelf. */
export interface BookDimensions {
  /** Trim height in millimetres (drives spine height on the shelf). */
  heightMm: number;
  /** Trim width in millimetres. */
  widthMm: number;
  /** Spine thickness in millimetres (drives spine width on the shelf). */
  thicknessMm: number;
}

/** Money is kept as minor units + currency so a Shopify mapping is trivial. */
export interface Money {
  /** Amount in minor units (e.g. yen has no minor unit, so this is just yen). */
  amount: number;
  /** ISO 4217 currency code. */
  currencyCode: string;
}

/**
 * The core aggregate. A `Book` is everything the UI needs to render a spine,
 * a cover, a detail overlay and a reading sample.
 */
export interface Book {
  id: string;
  /** Stable slug-like handle — maps to Shopify `handle`. */
  handle: string;
  title: string;
  author: string;
  /** Marketing / jacket-flap description for the detail overlay. */
  description: string;

  /** Visual treatment for the spine (we render spines with CSS, not images). */
  spine: {
    /** Base spine colour. */
    color: string;
    /** Secondary colour for gradient depth. */
    accent: string;
    /** Ink colour for the printed title/author. */
    textColor: string;
    /** Optional decorative band colour near the top of the spine. */
    band?: string;
  };

  /** Cover treatment shown in the detail overlay (also CSS-rendered). */
  cover: {
    background: string;
    textColor: string;
    /** Short tagline printed on the cover, distinct from the description. */
    tagline?: string;
  };

  dimensions: BookDimensions;
  pageCount: number;
  price: Money;

  category: ShelfCategory;
  featured: boolean;

  /** A few sample pages for the reading experience. */
  sample: SamplePage[];
}

/** A named, ordered collection of books — i.e. one horizontal shelf. */
export interface Shelf {
  id: string;
  category: ShelfCategory;
  title: string;
  /** Sub-label shown under the shelf title. */
  subtitle: string;
  /** Ordered book ids. Order is meaningful (left-to-right on the shelf). */
  bookIds: string[];
}
