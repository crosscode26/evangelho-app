import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

const DAILY_REMINDER_IDENTIFIER = "daily-reminder";
const DAILY_REMINDER_CHANNEL_ID = "daily-reminder";

export type ScheduleResult =
  | { success: true }
  | { success: false; reason: "permission-denied" | "unavailable" | "error"; error?: unknown };

async function ensureNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();

  if (current.granted) return true;

  if (
    current.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  ) {
    return true;
  }

  if (!current.canAskAgain) {
    return false;
  }

  const requested = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowSound: true,
      allowBadge: true,
    },
  });

  return requested.granted;
}

/**
 * Cria (ou atualiza) o canal de notificação no Android.
 * Precisa existir ANTES de agendar uma notificação que referencia esse channelId,
 * senão o agendamento pode ser silenciosamente ignorado.
 */
async function configureAndroidChannel(): Promise<void> {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync(DAILY_REMINDER_CHANNEL_ID, {
    name: "Lembrete diário",
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: "default",
    vibrationPattern: [0, 250, 250, 250],
  });
}

/**
 * Agenda (ou reagenda) o lembrete diário de inspiração.
 * Retorna um resultado explícito para que a UI (tela de Ajustes) possa
 * mostrar feedback ao usuário em vez de falhar silenciosamente.
 */
export async function scheduleDailyReminder(
  hour: number,
  minute: number
): Promise<ScheduleResult> {
  try {
    const hasPermission = await ensureNotificationPermission();
    if (!hasPermission) {
      return { success: false, reason: "permission-denied" };
    }

    await configureAndroidChannel();

    // Cancela apenas o lembrete diário anterior, não todas as notificações do app.
    
    await Notifications.cancelScheduledNotificationAsync(
      DAILY_REMINDER_IDENTIFIER
    ).catch(() => {
      // Não existe agendamento anterior com esse identifier: ignora.
    });

    await Notifications.scheduleNotificationAsync({
      identifier: DAILY_REMINDER_IDENTIFIER,
      content: {
        title: "Inspiração Diária",
        body: "Sua mensagem de hoje está esperando por você.",
        data: { type: "daily-draw" },
        sound: "default",
        color: "#8B6B2B",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
        channelId: DAILY_REMINDER_CHANNEL_ID,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("[scheduleDailyReminder] falhou ao agendar:", error);
    return { success: false, reason: "error", error };
  }
}

/**
 * Cancela o lembrete diário, se existir.
 */
export async function cancelDailyReminder(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(
    DAILY_REMINDER_IDENTIFIER
  ).catch(() => {
    // Não existe agendamento: nada a fazer.
  });
}