import React, { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  useFonts as useLoraFonts,
  Lora_400Regular,
  Lora_400Regular_Italic,
  Lora_600SemiBold,
} from "@expo-google-fonts/lora";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { AppDataProvider, useAppData } from "@/context/AppDataContext";
import { ThemeProvider, useAppTheme } from "@/context/ThemeContext";
import { RootNavigator } from "@/navigation/RootNavigator";

SplashScreen.preventAutoHideAsync().catch(() => {});

function AppShell() {
  const { isReady } = useAppData();
  const { colors, isDark } = useAppTheme();

  const [fontsLoaded] = useLoraFonts({
    Lora_400Regular,
    Lora_400Regular_Italic,
    Lora_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (isReady && fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [isReady, fontsLoaded]);

  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

  if (!isReady || !fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <RootNavigator />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppDataProvider>
        <ThemeProvider>
          <AppShell />
        </ThemeProvider>
      </AppDataProvider>
    </SafeAreaProvider>
  );
}