import { Platform } from "react-native";

// Desativado temporariamente para compatibilidade total com o Expo Go (SDK 53+)
// Quando for gerar a versão final para loja (Development Build / APK), basta reativar as chamadas.

export async function ensureNotificationPermission(): Promise<boolean> {
  console.warn("Notificações desativadas no modo Expo Go.");
  return false;
}

export async function configureAndroidChannel(): Promise<void> {
  return;
}

export async function scheduleDailyReminder(hour: number, minute: number): Promise<void> {
  console.warn('Lembrete diário agendado para ${hour}:${minute} (simulado no Expo Go).');
  return;
}

export async function cancelDailyReminder(): Promise<void> {
  return;
}