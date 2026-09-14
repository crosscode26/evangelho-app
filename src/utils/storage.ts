import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppSettings, ContentCategory, HistoryEntry } from "@/types";

const KEYS = {
  settings: "@evangelho/settings",
  history: "@evangelho/history",
  favorites: "@evangelho/favorites",
  lastItemId: "@evangelho/lastItemId",
};

const ALL_CATEGORIES: ContentCategory[] = [
  "espiritismo",
  "biblia",
  "filosofia",
  "pensadores",
  "reflexoes",
];

export const defaultSettings: AppSettings = {
  dailyReminderEnabled: false,
  dailyReminderHour: 7,
  dailyReminderMinute: 0,
  fontSize: "M",
  themePreference: "light",
  activeCategories: ALL_CATEGORIES,
};

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.settings);
    if (!raw) return defaultSettings;
    const parsed = { ...defaultSettings, ...JSON.parse(raw) };
    // Salvaguarda extra: se por algum motivo activeCategories vier vazio ou
    // corrompido de uma versão antiga salva no aparelho, volta pro padrão
    // completo em vez de deixar o sorteio quebrar.
    if (!Array.isArray(parsed.activeCategories) || parsed.activeCategories.length === 0) {
      parsed.activeCategories = ALL_CATEGORIES;
    }
    return parsed;
  } catch {
    return defaultSettings;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(KEYS.settings, JSON.stringify(settings));
}

export async function loadHistory(): Promise<HistoryEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.history);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function appendHistory(entry: HistoryEntry): Promise<HistoryEntry[]> {
  const current = await loadHistory();
  const updated = [entry, ...current].slice(0, 200); // cap history length
  await AsyncStorage.setItem(KEYS.history, JSON.stringify(updated));
  return updated;
}

export async function clearHistory(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.history);
}

export async function loadFavorites(): Promise<number[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.favorites);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function toggleFavorite(itemId: number): Promise<number[]> {
  const current = await loadFavorites();
  const exists = current.includes(itemId);
  const updated = exists ? current.filter((id) => id !== itemId) : [itemId, ...current];
  await AsyncStorage.setItem(KEYS.favorites, JSON.stringify(updated));
  return updated;
}

export async function loadLastItemId(): Promise<number | null> {
  const raw = await AsyncStorage.getItem(KEYS.lastItemId);
  return raw ? Number(raw) : null;
}

export async function saveLastItemId(id: number): Promise<void> {
  await AsyncStorage.setItem(KEYS.lastItemId, String(id));
}