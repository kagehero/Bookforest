# 本の森 — Hon no Mori

An immersive, **mobile-first interactive bookshelf** prototype. Not an e-commerce
site — a place to *wander*. You step into a misty forest, walk up to a glowing
cottage library, pull books off the shelf, turn them in your hands, read a few
pages, and discover something to love.

Built with **Next.js 15 · TypeScript · TailwindCSS · Framer Motion**.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000  (best viewed in a mobile viewport)
npm run build    # production build
```

> The whole experience is rendered in CSS — there are **no image assets**.
> Every spine, cover, and the forest scene are drawn with gradients, so it loads
> instantly and every book looks hand-crafted.

## The experience

| Scene | What happens |
|-------|--------------|
| **Forest landing** | Full-screen forest with a glowing cottage, drifting motes, and pointer/device-tilt parallax across three depth layers. |
| **Bookshelf** | Horizontally-scrolling wooden shelves. Each book is a CSS spine sized from its *real* trim dimensions, with vertical Japanese typography. |
| **Pull-out** | Tap a spine → it lifts off the shelf while the cover springs forward (3D `rotateY`) and the room darkens. |
| **Detail** | Mobile sheet with cover, description, price, page count, trim size, and actions. |
| **Reading** | A real-feeling reading view: warm paper grain, mincho type, 3D page-flip on swipe / edge-tap, 3–5 sample pages. |
| **Categories** | おすすめ / 新着 / 季節 shelves with an animated tab pill and crossfade transitions. |
| **Admin** *(hidden)* | **Triple-tap the「本の森」title** in the shelf view to open the store-keeper panel: add books, create shelves, drag-reorder. |

## Architecture

The codebase is deliberately structured so books can later come from **Shopify
Storefront API** with zero UI changes.

```
src/
  types/book.ts              Domain types (source-agnostic)
  lib/
    data/                    Curated mock catalogue (23 books, 3 shelves)
    repository/              BookRepository interface + MockBookRepository
                             └ getBookRepository() = the single swap point
    api/shopify.ts           Shopify product → Book mapper + GraphQL query (scaffold)
    format.ts                Money / dimension formatting
  hooks/useBookstore.ts      Client state over the repository (reads + admin writes)
  components/                ForestScene, Bookshelf, BookSpine, BookCover,
                             BookDetail, ReadingView, CartToast, AdminPanel, …
  app/                       layout, page (forest ⇆ shelf), globals.css
```

### Repository pattern — the Shopify seam

UI never imports a concrete data source; it calls `getBookRepository()`. Today
that returns an in-memory `MockBookRepository`. To go live:

```ts
// src/lib/repository/index.ts
export function getBookRepository(): BookRepository {
  return new ShopifyBookRepository({
    domain: process.env.SHOPIFY_STORE_DOMAIN!,
    token: process.env.SHOPIFY_STOREFRONT_TOKEN!,
  });
}
```

`src/lib/api/shopify.ts` already contains the product→`Book` mapper, the
Storefront GraphQL query, and the metafield/collection conventions, so the live
implementation is mechanical. Read methods are already `async`; spine/cover
colours live in a `hon_no_mori` metafield namespace with deterministic
fallbacks; shelves map to Shopify collections.

## Notes

- **Mobile-first**: the app is framed in a phone-width column (`max-w-md`).
- **Accessibility**: respects `prefers-reduced-motion`; spines/pages are real
  buttons with labels and focus rings.
- Admin mutations are in-memory only — a refresh restores the curated catalogue
  (by design, to keep the prototype's storytelling intact).
