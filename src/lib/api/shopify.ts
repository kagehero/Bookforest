import type { Book, Money, ShelfCategory } from "@/types/book";

/**
 * Shopify Storefront API integration scaffold.
 *
 * This file is the *contract sketch* for the eventual live integration. It is
 * NOT imported by the running prototype — the app uses the mock repository — but
 * it documents exactly how a Shopify product maps onto our `Book` domain type,
 * so wiring it up later is mechanical rather than a redesign.
 *
 * Mapping decisions:
 *  - Spine/cover colours are not native Shopify fields, so they live in product
 *    metafields under the `hon_no_mori` namespace (with a deterministic colour
 *    fallback derived from the product id).
 *  - Shelf membership is driven by Shopify Collections; `ShelfCategory` maps to
 *    a known set of collection handles.
 *  - Sample pages come from a `sample_pages` metafield (JSON) when present.
 */

/** Minimal slice of a Storefront `Product` we rely on. */
export interface ShopifyProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  vendor: string; // mapped to author
  totalInventory?: number;
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
  };
  metafields: Array<{ namespace: string; key: string; value: string } | null>;
}

export const SHOPIFY_NAMESPACE = "hon_no_mori";

export const COLLECTION_HANDLE_BY_CATEGORY: Record<ShelfCategory, string> = {
  recommended: "recommended",
  "new-arrivals": "new-arrivals",
  seasonal: "seasonal",
};

export const CATEGORY_BY_COLLECTION_HANDLE: Record<string, ShelfCategory> =
  Object.fromEntries(
    Object.entries(COLLECTION_HANDLE_BY_CATEGORY).map(([k, v]) => [v, k]),
  ) as Record<string, ShelfCategory>;

function metafield(
  product: ShopifyProduct,
  key: string,
): string | undefined {
  return product.metafields.find(
    (m) => m && m.namespace === SHOPIFY_NAMESPACE && m.key === key,
  )?.value;
}

/** Deterministic, pleasant colour derived from a stable string. */
function colorFromSeed(seed: string, lightness: number): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const hue = hash % 360;
  return `hsl(${hue} 28% ${lightness}%)`;
}

function parseMoney(p: { amount: string; currencyCode: string }): Money {
  return { amount: Math.round(parseFloat(p.amount)), currencyCode: p.currencyCode };
}

/**
 * Maps a Storefront product (+ the collection handle it was fetched under) into
 * our `Book`. This is the single point of coupling to Shopify's shape.
 */
export function mapShopifyProductToBook(
  product: ShopifyProduct,
  collectionHandle: string,
): Book {
  const category = CATEGORY_BY_COLLECTION_HANDLE[collectionHandle] ?? "recommended";
  const spineColor = metafield(product, "spine_color") ?? colorFromSeed(product.id, 28);
  const spineAccent = metafield(product, "spine_accent") ?? colorFromSeed(product.id, 16);

  const rawSample = metafield(product, "sample_pages");
  const sample: Book["sample"] = rawSample
    ? JSON.parse(rawSample)
    : [
        {
          pageNumber: 1,
          paragraphs: [product.description.slice(0, 280)],
        },
      ];

  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    author: product.vendor,
    description: product.description,
    spine: {
      color: spineColor,
      accent: spineAccent,
      textColor: metafield(product, "spine_text_color") ?? "#f0e6d0",
      band: metafield(product, "spine_band"),
    },
    cover: {
      background:
        metafield(product, "cover_background") ??
        `linear-gradient(160deg,${spineColor},${spineAccent})`,
      textColor: metafield(product, "cover_text_color") ?? "#f0e6d0",
      tagline: metafield(product, "cover_tagline"),
    },
    dimensions: {
      heightMm: Number(metafield(product, "height_mm") ?? 184),
      widthMm: Number(metafield(product, "width_mm") ?? 124),
      thicknessMm: Number(metafield(product, "thickness_mm") ?? 18),
    },
    pageCount: Number(metafield(product, "page_count") ?? 240),
    price: parseMoney(product.priceRange.minVariantPrice),
    category,
    featured: metafield(product, "featured") === "true",
    sample,
  };
}

/**
 * The Storefront GraphQL query a `ShopifyBookRepository` would issue per shelf.
 * Kept here next to the mapper for easy maintenance.
 */
export const PRODUCTS_BY_COLLECTION_QUERY = /* GraphQL */ `
  query ProductsByCollection($handle: String!, $first: Int!) {
    collection(handle: $handle) {
      products(first: $first) {
        nodes {
          id
          handle
          title
          description
          vendor
          totalInventory
          priceRange { minVariantPrice { amount currencyCode } }
          metafields(identifiers: [
            { namespace: "hon_no_mori", key: "spine_color" }
            { namespace: "hon_no_mori", key: "spine_accent" }
            { namespace: "hon_no_mori", key: "spine_text_color" }
            { namespace: "hon_no_mori", key: "spine_band" }
            { namespace: "hon_no_mori", key: "cover_background" }
            { namespace: "hon_no_mori", key: "cover_text_color" }
            { namespace: "hon_no_mori", key: "cover_tagline" }
            { namespace: "hon_no_mori", key: "height_mm" }
            { namespace: "hon_no_mori", key: "width_mm" }
            { namespace: "hon_no_mori", key: "thickness_mm" }
            { namespace: "hon_no_mori", key: "page_count" }
            { namespace: "hon_no_mori", key: "featured" }
            { namespace: "hon_no_mori", key: "sample_pages" }
          ]) { namespace key value }
        }
      }
    }
  }
`;
