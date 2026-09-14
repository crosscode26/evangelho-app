import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

// Configura como o app se comporta ao receber a notificação com ele aberto
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

let channelConfigured = false;

async function configureAndroidChannel(): Promise<void> {
  if (Platform.OS !== "android" || channelConfigured) return;
  await Notifications.setNotificationChannelAsync("daily-reminder", {
    name: "Lembrete diário",
    importance: Notifications.AndroidImportance.HIGH,
    sound: "default",
    vibrate: [0, 250, 250, 250],
  });
  channelConfigured = true;
}

export async function ensureNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function scheduleDailyReminder(hour: number, minute: number): Promise<void> {
  const hasPermission = await ensureNotificationPermission();
  if (!hasPermission) return;

  await configureAndroidChannel();
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Inspiração Diária",
      body: "Sua mensagem de hoje está esperando por você.",
      data: { type: "daily-draw" },
      sound: "default",
    },
    trigger: {
      hour,
      minute,
      repeats: true,
      channelId: "daily-reminder",
    },
  });
}

export async function cancelDailyReminder(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}