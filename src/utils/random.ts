import chaptersData from "@/data/chapters.json";
import { ContentCategory, GospelChapter, GospelItem } from "@/types";

const chapters = chaptersData as GospelChapter[];

export const allItems: GospelItem[] = chapters.flatMap((chapter) => chapter.items);

export function getItemById(id: number): GospelItem | undefined {
  return allItems.find((item) => item.id === id);
}

function getPoolForCategories(activeCategories: ContentCategory[]): GospelItem[] {
  const filtered = allItems.filter((item) => activeCategories.includes(item.category));
  // Se por algum motivo o filtro resultar em pool vazio (ex: dado corrompido),
  // volta para o pool completo para não travar o sorteio.
  return filtered.length > 0 ? filtered : allItems;
}

/**
 * Draws a random item from the pool of active categories, avoiding an exact
 * repeat of lastItemId whenever the pool has more than one entry.
 */
export function drawRandomItem(
  lastItemId: number | null,
  activeCategories: ContentCategory[]
): GospelItem {
  const pool = getPoolForCategories(activeCategories);

  if (pool.length === 1) return pool[0];

  let candidate: GospelItem;
  do {
    const index = Math.floor(Math.random() * pool.length);
    candidate = pool[index];
  } while (lastItemId !== null && candidate.id === lastItemId);

  return candidate;
}