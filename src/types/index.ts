export interface GospelItem {
  id: number;
  chapterNumber: number;
  chapterTitle: string;
  itemNumber: number;
  itemTitle: string;
  content: string;
}

export interface GospelChapter {
  chapterNumber: number;
  chapterTitle: string;
  items: GospelItem[];
}

export interface HistoryEntry {
  entryId: string;
  itemId: number;
  drawnAt: string; // ISO timestamp
}

export type FontSizeOption = "P" | "M" | "G" | "GG";

export type PlaybackSpeed = 1.0 | 1.25 | 1.5;

export type PlaybackState = "idle" | "playing" | "paused";

export interface AppSettings {
  dailyReminderEnabled: boolean;
  dailyReminderHour: number;
  dailyReminderMinute: number;
  fontSize: FontSizeOption;
  themePreference: "light" | "dark" | "system";
}

export type RootStackParamList = {
  MainTabs: { screen?: keyof MainTabParamList } | undefined;
  Reading: { itemId: number; fromHistory?: boolean };
};

export type MainTabParamList = {
  Home: undefined;
  History: undefined;
  Settings: undefined;
};
