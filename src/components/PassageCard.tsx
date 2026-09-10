import React from "react";
import { Pressable, View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";
import { fonts } from "@/theme/typography";
import { GospelItem } from "@/types";

interface PassageCardProps {
  item: GospelItem;
  timestampLabel: string;
  isFavorite: boolean;
  onPress: () => void;
}

export function PassageCard({ item, timestampLabel, isFavorite, onPress }: PassageCardProps) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.chapterLabel, { color: colors.textMuted }]} numberOfLines={1}>
          Cap. {item.chapterNumber} · {item.chapterTitle}
        </Text>
        {isFavorite && <Feather name="heart" size={14} color={colors.accent} />}
      </View>
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
        {item.itemTitle}
      </Text>
      <Text style={[styles.timestamp, { color: colors.textMuted }]}>{timestampLabel}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  chapterLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    flexShrink: 1,
    marginRight: 8,
  },
  title: {
    fontFamily: fonts.serifBold,
    fontSize: 17,
    lineHeight: 22,
    marginBottom: 8,
  },
  timestamp: {
    fontFamily: fonts.sans,
    fontSize: 12,
  },
});
