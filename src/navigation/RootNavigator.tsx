import React, { useEffect, useRef } from "react";
import { NavigationContainer, NavigationContainerRef } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { BottomTabs } from "@/navigation/BottomTabs";
import { ReadingScreen } from "@/screens/ReadingScreen";
import { useAppData } from "@/context/AppDataContext";
import { RootStackParamList } from "@/types";

const Stack = createNativeStackNavigator<RootStackParamList>();
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export function RootNavigator() {
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);
  const { drawNewPassage } = useAppData();

  useEffect(() => {
    // Se estiver rodando no Expo Go, ignora os listeners para evitar o crash nativo
    if (isExpoGo) return;

    try {
      // Import dinâmico para evitar leitura do bundler no Expo Go
      const Notifications = eval('require')("expo-notifications");

      const handleResponse = async (response: any) => {
        const type = response?.notification?.request?.content?.data?.type;
        if (type !== "daily-draw") return;
        const item = await drawNewPassage();
        navigationRef.current?.navigate("Reading", { itemId: item.id });
      };

      Notifications.getLastNotificationResponseAsync().then((response: any) => {
        if (response) handleResponse(response);
      });

      const subscription = Notifications.addNotificationResponseReceivedListener(handleResponse);

      return () => {
        subscription.remove();
      };
    } catch {
      // Ignora chamadas caso o módulo não esteja disponível
    }
  }, [drawNewPassage]);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: "fade", 
          animationDuration: 350, 
        }}
      >
        <Stack.Screen name="MainTabs" component={BottomTabs} />
        <Stack.Screen 
          name="Reading" 
          component={ReadingScreen}
          options={{
            animation: "fade_from_bottom", 
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}