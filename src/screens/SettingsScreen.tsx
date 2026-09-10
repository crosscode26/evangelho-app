import React, { useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, Switch, Pressable, Platform, ScrollView } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Feather } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";
import { useAppData } from "@/context/AppDataContext";
import { fonts } from "@/theme/typography";
import { FontSizeOption } from "@/types";

const FONT_OPTIONS: { key: FontSizeOption; label: string }[] = [
  { key: "P", label: "P" },
  { key: "M", label: "M" },
  { key: "G", label: "G" },
  { key: "GG", label: "GG" },
];

const THEME_OPTIONS: { key: "light" | "dark" | "system"; label: string }[] = [
  { key: "system", label: "Sistema" },
  { key: "light", label: "Claro" },
  { key: "dark", label: "Escuro" },
];

export function SettingsScreen() {
  const { colors } = useAppTheme();
  const { settings, updateSettings } = useAppData();
  const [showPicker, setShowPicker] = useState(false);

  const reminderDate = new Date();
  reminderDate.setHours(settings.dailyReminderHour, settings.dailyReminderMinute, 0, 0);

  const handleTimeChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === "android") setShowPicker(false);
    if (event.type === "dismissed" || !selected) return;
    updateSettings({
      dailyReminderHour: selected.getHours(),
      dailyReminderMinute: selected.getMinutes(),
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Configurações</Text>

        <Section title="Lembrete diário" colors={colors}>
          <Row
            colors={colors}
            left={
              <>
                <Text style={[styles.rowLabel, { color: colors.text }]}>Notificação diária</Text>
                <Text style={[styles.rowSubtitle, { color: colors.textMuted }]}>
                  Receba uma mensagem para sortear todos os dias
                </Text>
              </>
            }
            right={
              <Switch
                value={settings.dailyReminderEnabled}
                onValueChange={(value) => updateSettings({ dailyReminderEnabled: value })}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor="#FFFFFF"
              />
            }
          />

          {settings.dailyReminderEnabled && (
            <Pressable
              style={[styles.timeRow, { borderColor: colors.border }]}
              onPress={() => setShowPicker(true)}
            >
              <Feather name="clock" size={18} color={colors.accent} />
              <Text style={[styles.timeLabel, { color: colors.text }]}>
                {reminderDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </Text>
              <Feather name="chevron-right" size={18} color={colors.textMuted} />
            </Pressable>
          )}

          {showPicker && (
            <DateTimePicker
              value={reminderDate}
              mode="time"
              is24Hour
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleTimeChange}
            />
          )}
        </Section>

        <Section title="Aparência" colors={colors}>
          <Text style={[styles.rowLabel, { color: colors.text, marginBottom: 12 }]}>Tema</Text>
          <View style={styles.chipRow}>
            {THEME_OPTIONS.map((option) => (
              <Chip
                key={option.key}
                label={option.label}
                active={settings.themePreference === option.key}
                colors={colors}
                onPress={() => updateSettings({ themePreference: option.key })}
              />
            ))}
          </View>
        </Section>

        <Section title="Leitura" colors={colors}>
          <Text style={[styles.rowLabel, { color: colors.text, marginBottom: 12 }]}>
            Tamanho do texto padrão
          </Text>
          <View style={styles.chipRow}>
            {FONT_OPTIONS.map((option) => (
              <Chip
                key={option.key}
                label={option.label}
                active={settings.fontSize === option.key}
                colors={colors}
                onPress={() => updateSettings({ fontSize: option.key })}
              />
            ))}
          </View>
        </Section>

        <Text style={[styles.footerNote, { color: colors.textMuted }]}>
          O Evangelho Segundo o Espiritismo{"\n"}Versão 1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  title,
  colors,
  children,
}: {
  title: string;
  colors: ReturnType<typeof useAppTheme>["colors"];
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{title}</Text>
      {children}
    </View>
  );
}

function Row({
  left,
  right,
  colors,
}: {
  left: React.ReactNode;
  right: React.ReactNode;
  colors: ReturnType<typeof useAppTheme>["colors"];
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>{left}</View>
      {right}
    </View>
  );
}

function Chip({
  label,
  active,
  colors,
  onPress,
}: {
  label: string;
  active: boolean;
  colors: ReturnType<typeof useAppTheme>["colors"];
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? colors.accent : colors.surfaceAlt,
          borderColor: colors.border,
        },
      ]}
    >
      <Text style={[styles.chipLabel, { color: active ? "#FFFFFF" : colors.textMuted }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  headerTitle: {
    fontFamily: fonts.serifBold,
    fontSize: 24,
    marginBottom: 20,
  },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    marginBottom: 18,
  },
  sectionTitle: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 12,
    letterSpacing: 0.3,
    marginBottom: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowLeft: {
    flex: 1,
    paddingRight: 12,
  },
  rowLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 15,
  },
  rowSubtitle: {
    fontFamily: fonts.sans,
    fontSize: 12,
    marginTop: 2,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 14,
  },
  timeLabel: {
    flex: 1,
    fontFamily: fonts.sansSemiBold,
    fontSize: 15,
    marginLeft: 10,
  },
  chipRow: {
    flexDirection: "row",
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginRight: 8,
  },
  chipLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
  },
  footerNote: {
    fontFamily: fonts.sans,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    marginTop: 8,
  },
});
