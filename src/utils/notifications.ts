import { Platform } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";


const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

let cachedModule: any = null;

function getNotificationsModule(): any {
  if (isExpoGo) return null;
  if (cachedModule) return cachedModule;
  try {
    // eslint-disable-next-line no-eval
    cachedModule = eval("require")("expo-notifications");
    return cachedModule;
  } catch {
    return null;
  }
}

let channelConfigured = false;

async function configureAndroidChannel(Notifications: any): Promise<void> {
  if (Platform.OS !== "android" || channelConfigured) return;
  await Notifications.setNotificationChannelAsync("daily-reminder", {
    name: "Lembrete diário",
    importance: Notifications.AndroidImportance.DEFAULT,
  });
  channelConfigured = true;
}

export async function ensureNotificationPermission(): Promise<boolean> {
  const Notifications = getNotificationsModule();
  if (!Notifications) {
    console.warn("Notificações indisponíveis neste ambiente (Expo Go).");
    return false;
  }

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;

  const requested = await Notifications.requestPermissionsAsync();
  return !!requested.granted;
}

export async function scheduleDailyReminder(hour: number, minute: number): Promise<void> {
  const Notifications = getNotificationsModule();
  if (!Notifications) {
    console.warn(`Lembrete diário ${hour}:${minute} não agendado (indisponível no Expo Go).`);
    return;
  }

  await configureAndroidChannel(Notifications);

  
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Inspira",
      body: "Sua mensagem de hoje está esperando por você.",
      data: { type: "daily-draw" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes?.DAILY ?? "daily",
      hour,
      minute,
    },
  });
}

export async function cancelDailyReminder(): Promise<void> {
  const Notifications = getNotificationsModule();
  if (!Notifications) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}