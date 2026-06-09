import type { Shelf } from "@/types/book";
import { MOCK_BOOKS } from "./books";

/**
 * Default shelf definitions. Order within `bookIds` is derived from the catalogue
 * order but is independently mutable (the admin simulation reorders these without
 * touching the books themselves).
 */
function idsFor(category: Shelf["category"]) {
  return MOCK_BOOKS.filter((b) => b.category === category).map((b) => b.id);
}

export const MOCK_SHELVES: Shelf[] = [
  {
    id: "shelf-recommended",
    category: "recommended",
    title: "おすすめの本棚",
    subtitle: "店主が選ぶ、今宵の一冊",
    bookIds: idsFor("recommended"),
  },
  {
    id: "shelf-new-arrivals",
    category: "new-arrivals",
    title: "あたらしい本棚",
    subtitle: "森に届いたばかりの物語",
    bookIds: idsFor("new-arrivals"),
  },
  {
    id: "shelf-seasonal",
    category: "seasonal",
    title: "季節の本棚",
    subtitle: "巡る季節に寄りそう selection",
    bookIds: idsFor("seasonal"),
  },
];
