import React, { createContext, useContext, useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  defaultSettings,
  loadSettings,
  saveSettings,
  loadHistory,
  appendHistory,
  clearHistory as clearHistoryStorage,
  loadFavorites,
  toggleFavorite as toggleFavoriteStorage,
  loadLastItemId,
  saveLastItemId,
} from "@/utils/storage";
import { drawRandomItem, getItemById } from "@/utils/random";
import {
  scheduleDailyReminder,
  cancelDailyReminder,
  ensureNotificationPermission,
} from "@/utils/notifications";
import { AppSettings, GospelItem, HistoryEntry } from "@/types";

interface AppDataContextValue {
  isReady: boolean;
  settings: AppSettings;
  history: HistoryEntry[];
  favorites: number[];
  drawNewPassage: () => Promise<GospelItem>;
  recordHistoryFor: (itemId: number) => Promise<void>;
  toggleFavoriteFor: (itemId: number) => Promise<void>;
  isFavorite: (itemId: number) => boolean;
  updateSettings: (partial: Partial<AppSettings>) => Promise<void>;
  clearAllHistory: () => Promise<void>;
}

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [lastItemId, setLastItemId] = useState<number | null>(null);

  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [loadedSettings, loadedHistory, loadedFavorites, loadedLastId] = await Promise.all([
          loadSettings(),
          loadHistory(),
          loadFavorites(),
          loadLastItemId(),
        ]);
        if (isMounted) {
          setSettings(loadedSettings);
          settingsRef.current = loadedSettings;
          setHistory(loadedHistory);
          setFavorites(loadedFavorites);
          setLastItemId(loadedLastId);
          setIsReady(true);

          // Sincroniza e reagenda o lembrete diário na inicialização se estiver ativo
          if (loadedSettings.dailyReminderEnabled) {
            const granted = await ensureNotificationPermission();
            if (granted) {
              await scheduleDailyReminder(
                loadedSettings.dailyReminderHour,
                loadedSettings.dailyReminderMinute
              );
            }
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const recordHistoryFor = useCallback(async (itemId: number) => {
    const entry: HistoryEntry = {
      entryId: `${itemId}-${Date.now()}`,
      itemId,
      drawnAt: new Date().toISOString(),
    };
    const updated = await appendHistory(entry);
    setHistory(updated);
    await saveLastItemId(itemId);
    setLastItemId(itemId);
  }, []);

  const drawNewPassage = useCallback(async (): Promise<GospelItem> => {
    const item = drawRandomItem(lastItemId, settings.activeCategories);
    await recordHistoryFor(item.id);
    return item;
  }, [lastItemId, settings.activeCategories, recordHistoryFor]);

  const toggleFavoriteFor = useCallback(async (itemId: number) => {
    const updated = await toggleFavoriteStorage(itemId);
    setFavorites(updated);
  }, []);

  const isFavorite = useCallback(
    (itemId: number) => favorites.includes(itemId),
    [favorites]
  );

  const updateSettings = useCallback(async (partial: Partial<AppSettings>) => {
    const updated = { ...settingsRef.current, ...partial };
    setSettings(updated);
    settingsRef.current = updated;
    saveSettings(updated).catch((err) => console.error("Erro ao salvar configurações:", err));

    const touchesReminder =
      partial.dailyReminderEnabled !== undefined ||
      partial.dailyReminderHour !== undefined ||
      partial.dailyReminderMinute !== undefined;

    if (!touchesReminder) return;

    if (updated.dailyReminderEnabled) {
      const granted = await ensureNotificationPermission();
      if (granted) {
        await scheduleDailyReminder(updated.dailyReminderHour, updated.dailyReminderMinute);
      } else {
        const reverted = { ...updated, dailyReminderEnabled: false };
        setSettings(reverted);
        settingsRef.current = reverted;
        await saveSettings(reverted);
      }
    } else {
      await cancelDailyReminder();
    }
  }, []);

  const clearAllHistory = useCallback(async () => {
    await clearHistoryStorage();
    setHistory([]);
  }, []);

  const value = useMemo<AppDataContextValue>(
    () => ({
      isReady,
      settings,
      history,
      favorites,
      drawNewPassage,
      recordHistoryFor,
      toggleFavoriteFor,
      isFavorite,
      updateSettings,
      clearAllHistory,
    }),
    [
      isReady,
      settings,
      history,
      favorites,
      drawNewPassage,
      recordHistoryFor,
      toggleFavoriteFor,
      isFavorite,
      updateSettings,
      clearAllHistory,
    ]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData deve ser usado dentro de um AppDataProvider");
  return ctx;
}

export { getItemById };