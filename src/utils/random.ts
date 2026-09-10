import chaptersData from "@/data/chapters.json";
import { GospelChapter, GospelItem } from "@/types";

const chapters = chaptersData as GospelChapter[];

export const allItems: GospelItem[] = chapters.flatMap((chapter) => chapter.items);

export function getItemById(id: number): GospelItem | undefined {
  return allItems.find((item) => item.id === id);
}

/**
 * Draws a random item from the full pool, avoiding an exact repeat of
 * lastItemId whenever the pool has more than one entry.
 */
export function drawRandomItem(lastItemId: number | null): GospelItem {
  if (allItems.length === 1) return allItems[0];

  let candidate: GospelItem;
  do {
    const index = Math.floor(Math.random() * allItems.length);
    candidate = allItems[index];
  } while (lastItemId !== null && candidate.id === lastItemId);

  return candidate;
}
