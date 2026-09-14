import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HomeScreen } from "@/screens/HomeScreen";
import { HistoryScreen } from "@/screens/HistoryScreen";
import { SettingsScreen } from "@/screens/SettingsScreen";
import { useAppTheme } from "@/context/ThemeContext";
import { fonts } from "@/theme/typography";
import { MainTabParamList } from "@/types";

const Tab = createBottomTabNavigator<MainTabParamList>();

const ICONS: Record<keyof MainTabParamList, keyof typeof Feather.glyphMap> = {
  Home: "home",
  History: "clock",
  Settings: "settings",
};

const LABELS: Record<keyof MainTabParamList, string> = {
  Home: "Início",
  History: "Histórico",
  Settings: "Ajustes",
};

export function BottomTabs() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          // Soma os 64px padrão ao tamanho do botão/menu do Android/iOS
          height: 64 + insets.bottom,
          // Empurra os ícones e textos para cima da área protegida
          paddingBottom: insets.bottom > 0 ? insets.bottom + 4 : 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: fonts.sansMedium,
          fontSize: 11,
        },
        tabBarIcon: ({ color, size }) => (
          <Feather
            name={ICONS[route.name as keyof MainTabParamList]}
            color={color}
            size={size ? size - 2 : 20}
          />
        ),
        tabBarLabel: LABELS[route.name as keyof MainTabParamList],
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}