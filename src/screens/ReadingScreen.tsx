import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Share,
  SafeAreaView,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";
import { useAppData } from "@/context/AppDataContext";
import { getItemById } from "@/utils/random";
import { AudioPlayer } from "@/components/AudioPlayer";
import { fonts, readingFontSizes } from "@/theme/typography";
import { FontSizeOption, RootStackParamList } from "@/types";

type ReadingRoute = RouteProp<RootStackParamList, "Reading">;
type Nav = NativeStackNavigationProp<RootStackParamList>;

const FONT_STEPS: FontSizeOption[] = ["P", "M", "G", "GG"];

export function ReadingScreen() {
  const route = useRoute<ReadingRoute>();
  const navigation = useNavigation<Nav>();
  const { colors } = useAppTheme();
  const { settings, updateSettings, isFavorite, toggleFavoriteFor } = useAppData();

  const item = useMemo(() => getItemById(route.params.itemId), [route.params.itemId]);
  const favorite = item ? isFavorite(item.id) : false;

  if (!item) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyState}>
          <Feather name="alert-circle" size={28} color={colors.textMuted} />
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>
            Não foi possível encontrar esta passagem.
          </Text>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={[styles.emptyLink, { color: colors.accent }]}>Voltar</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const currentStepIndex = FONT_STEPS.indexOf(settings.fontSize);
  const fontConfig = readingFontSizes[settings.fontSize];

  const adjustFontSize = (direction: 1 | -1) => {
    const nextIndex = Math.min(Math.max(currentStepIndex + direction, 0), FONT_STEPS.length - 1);
    updateSettings({ fontSize: FONT_STEPS[nextIndex] });
  };

  const handleShare = async () => {
    await Share.share({
      message: `"${item.itemTitle}"\n\n${item.content}\n\n— O Evangelho Segundo o Espiritismo, cap. ${item.chapterNumber} (${item.chapterTitle})`,
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Feather name="chevron-left" size={24} color={colors.text} />
        </Pressable>

        <View style={styles.topBarActions}>
          <Pressable onPress={() => adjustFontSize(-1)} hitSlop={10} style={styles.topBarIcon}>
            <Text style={[styles.fontStepLabel, { color: colors.textMuted }]}>A-</Text>
          </Pressable>
          <Pressable onPress={() => adjustFontSize(1)} hitSlop={10} style={styles.topBarIcon}>
            <Text style={[styles.fontStepLabel, { color: colors.text }]}>A+</Text>
          </Pressable>
          <Pressable onPress={() => toggleFavoriteFor(item.id)} hitSlop={10} style={styles.topBarIcon}>
            <Feather
              name="heart"
              size={20}
              color={favorite ? colors.accent : colors.textMuted}
              style={favorite ? undefined : styles.heartOutline}
            />
          </Pressable>
          <Pressable onPress={handleShare} hitSlop={10} style={styles.topBarIcon}>
            <Feather name="share-2" size={20} color={colors.textMuted} />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.chapterMeta, { color: colors.accent }]}>
          CAPÍTULO {item.chapterNumber} · {item.chapterTitle.toUpperCase()}
        </Text>
        <Text style={[styles.title, { color: colors.text }]}>{item.itemTitle}</Text>
        <Text
          style={[
            styles.body,
            {
              color: colors.text,
              fontSize: fontConfig.size,
              lineHeight: fontConfig.lineHeight,
            },
          ]}
        >
          {item.content}
        </Text>
      </ScrollView>

      <View style={styles.playerWrapper}>
        <AudioPlayer text={item.content} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  topBarActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  topBarIcon: {
    marginLeft: 18,
  },
  heartOutline: {
    opacity: 0.7,
  },
  fontStepLabel: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 15,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  chapterMeta: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 12,
    letterSpacing: 0.4,
    marginBottom: 12,
  },
  title: {
    fontFamily: fonts.serifBold,
    fontSize: 24,
    lineHeight: 31,
    marginBottom: 20,
  },
  body: {
    fontFamily: fonts.serif,
  },
  playerWrapper: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    fontFamily: fonts.sans,
    fontSize: 15,
    textAlign: "center",
    marginTop: 12,
    marginBottom: 16,
  },
  emptyLink: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 15,
  },
});
