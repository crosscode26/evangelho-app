import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRoute, useNavigation } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { useAppTheme } from "@/context/ThemeContext";
import { useAppData } from "@/context/AppDataContext";
import { getItemById } from "@/utils/random";
import { AudioPlayer } from "@/components/AudioPlayer";
import { fonts, readingFontSizes } from "@/theme/typography";
import { FontSizeOption, RootStackParamList } from "@/types";
import { Image } from "react-native";

type ReadingRoute = RouteProp<RootStackParamList, "Reading">;
type Nav = NativeStackNavigationProp<RootStackParamList>;

const FONT_STEPS: FontSizeOption[] = ["P", "M", "G", "GG"];
const CARD_SIZE = 1080; // tamanho final real do card, já no valor de exportação
const logoImage = require("../../assets/logo.png");

// Habilita LayoutAnimation no Android (no iOS já vem ligado)
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export function ReadingScreen() {
  const route = useRoute<ReadingRoute>();
  const navigation = useNavigation<Nav>();
  const { colors } = useAppTheme();
  const { settings, updateSettings, isFavorite, toggleFavoriteFor } = useAppData();
  const shareCardRef = useRef<ViewShot>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

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

  const togglePlayer = () => {
    // Anima a entrada/saída do player (fade + leve deslize) sem precisar de Animated.Value
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsPlayerOpen((prev) => !prev);
  };

  // Ajusta o tamanho da fonte do card compartilhável conforme o comprimento do texto,
  // já calculado na escala real de 1080px (fontes maiores que as usadas na tela).
  const shareBodyFontSize = useMemo(() => {
    const length = item.content.length;
    if (length <= 180) return 46;
    if (length <= 320) return 40;
    if (length <= 480) return 34;
    if (length <= 650) return 29;
    return 25;
  }, [item.content]);

  const shareBodyLineHeight = shareBodyFontSize * 1.55;

  const handleShare = async () => {
    try {
      if (!shareCardRef.current?.capture) return;
      const uri = await shareCardRef.current.capture();

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: "image/png",
          dialogTitle: "Compartilhar mensagem",
        });
      }
    } catch (error) {
      console.log("Erro ao compartilhar:", error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top"]}>
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        <View style={styles.topBarSide}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Feather name="chevron-left" size={24} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.topBarCenter}>
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
          {/* Toggle do player de áudio: ícone muda de cor/estilo quando o player está aberto */}
          <Pressable onPress={togglePlayer} hitSlop={10} style={styles.topBarIcon}>
            <Feather
              name="volume-2"
              size={20}
              color={isPlayerOpen ? colors.accent : colors.textMuted}
            />
          </Pressable>
          <Pressable onPress={handleShare} hitSlop={10} style={styles.topBarIcon}>
            <Feather name="share-2" size={20} color={colors.textMuted} />
          </Pressable>
        </View>

        <View style={styles.topBarSide} />
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

      {/* Player só é montado (e só existe na árvore) quando o usuário abre;
          isso garante que o áudio pare sozinho ao fechar, via cleanup do AudioPlayer */}
      {isPlayerOpen && (
        <View style={styles.playerWrapper}>
          <AudioPlayer text={item.content} />
        </View>
      )}

      {/* Card invisível, fora da tela, usado só para gerar a imagem de compartilhamento */}
      <View style={styles.hiddenCardWrapper} pointerEvents="none">
        <ViewShot ref={shareCardRef} options={{ format: "png", quality: 1 }}>
          <LinearGradient
            colors={[colors.surfaceAlt, colors.background]}
            style={[styles.shareCard, { width: CARD_SIZE, height: CARD_SIZE }]}
          >
            <View style={styles.shareInner}>
              {/* Bloco Superior e Central */}
              <View style={styles.shareContent}>
                <View style={styles.shareHeader}>
                  <Text style={[styles.shareHeaderEmblem, { color: colors.accent }]}>✦</Text>
                  <Text style={[styles.shareHeaderText, { color: colors.textMuted }]}>
                    Inspira
                  </Text>
                </View>

                <View style={[styles.chapterBadge, { backgroundColor: colors.accent }]}>
                  <Text style={styles.chapterBadgeText}>CAP. {item.chapterNumber}</Text>
                </View>

                <Text style={[styles.shareTitle, { color: colors.text }]} numberOfLines={2}>
                  {item.itemTitle}
                </Text>

                {/* Limita as linhas para não invadir o rodapé */}
                <Text
                  style={[
                    styles.shareBody,
                    {
                      color: colors.text,
                      fontSize: shareBodyFontSize,
                      lineHeight: shareBodyLineHeight,
                    },
                  ]}
                  numberOfLines={11}
                >
                  {item.content}
                </Text>
              </View>

              {/* Rodapé Fixo no Fluxo */}
              <View style={styles.shareFooter}>
                <View style={[styles.shareFooterLine, { backgroundColor: colors.border }]} />
                <Image
                  source={logoImage}
                  style={styles.shareFooterLogo}
                  resizeMode="contain"
                />
                <Text style={[styles.shareFooterSubtext, { color: colors.textMuted }]}>
                  Sintonize sua intençao e receba o conselho do dia
                </Text>
              </View>
            </View>
          </LinearGradient>
        </ViewShot>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  shareFooterLogo: {
    width: 120,
    height: 40,
    alignSelf: 'center',
    marginVertical: 8,
  },
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
  topBarSide: {
    width: 24,
  },
  topBarCenter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  topBarIcon: {
    marginHorizontal: 12,
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
  // Estilos do card de compartilhamento (fica fora da tela visível, tamanho real 1080x1080)
  hiddenCardWrapper: {
    position: "absolute",
    top: -99999,
    left: -99999,
  },
  shareCard: {
    overflow: "hidden",
  },
  shareInner: {
    flex: 1,
    paddingTop: 56,
    paddingBottom: 48,
    paddingHorizontal: 72,
    justifyContent: "space-between",
    alignItems: "center",
  },
  shareContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  shareHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  shareHeaderEmblem: {
    fontSize: 28,
    marginBottom: 4,
  },
  shareHeaderText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 14,
    letterSpacing: 3,
  },
  chapterBadge: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 40,
    marginBottom: 20,
  },
  chapterBadgeText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 20,
    letterSpacing: 1,
    color: "#FFFFFF",
  },
  shareTitle: {
    fontFamily: fonts.serifBold,
    fontSize: 36,
    lineHeight: 46,
    textAlign: "center",
    marginBottom: 20,
  },
  shareBody: {
    fontFamily: fonts.serif,
    textAlign: "center",
  },
  shareFooter: {
    alignItems: "center",
    width: "100%",
    marginTop: 16,
  },
  shareFooterLine: {
    width: 60,
    height: 1,
    marginBottom: 16,
  },
  shareFooterLogo: {
    width: 120,
    height: 40,
    alignSelf: "center",
    marginVertical: 6,
  },
  shareFooterSubtext: {
    fontFamily: fonts.sans,
    fontSize: 15,
    letterSpacing: 0.5,
  },
});