import React, { useState } from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAppTheme } from "@/context/ThemeContext";
import { useAppData } from "@/context/AppDataContext";
import { PrimaryButton } from "@/components/PrimaryButton";
import { fonts } from "@/theme/typography";
import { RootStackParamList } from "@/types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const { colors } = useAppTheme();
  const { drawNewPassage } = useAppData();
  const navigation = useNavigation<Nav>();
  const [isDrawing, setIsDrawing] = useState(false);

  const handleDraw = async () => {
    if (isDrawing) return;
    setIsDrawing(true);
    try {
      const item = await drawNewPassage();
      navigation.navigate("Reading", { itemId: item.id });
    } finally {
      setIsDrawing(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={[styles.emblem, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
          <Text style={styles.emblemGlyph}>✦</Text>
        </View>

        <Text style={[styles.eyebrow, { color: colors.textMuted }]}>
          Inspiração Diária
        </Text>
        <Text style={[styles.headline, { color: colors.text }]}>
          Uma pausa para{"\n"}inspiração e fé
        </Text>
        <Text style={[styles.subtext, { color: colors.textMuted }]}>
          Deixe que a mensagem de hoje encontre você.
        </Text>

        <PrimaryButton
          label={isDrawing ? "Consultando…" : "Consultar"}
          icon="shuffle"
          variant="circular"
          size={170}
          onPress={handleDraw}
          disabled={isDrawing}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emblem: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  emblemGlyph: {
    fontSize: 34,
    color: "#C9A24B",
  },
  eyebrow: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    letterSpacing: 0.3,
    textAlign: "center",
    marginBottom: 16,
  },
  headline: {
    fontFamily: fonts.serifBold,
    fontSize: 30,
    lineHeight: 38,
    textAlign: "center",
    marginBottom: 16,
  },
  subtext: {
    fontFamily: fonts.sans,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    maxWidth: 280,
    marginBottom: 8,
  },
});