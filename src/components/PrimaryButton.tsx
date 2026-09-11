import React from "react";
import { Pressable, Text, StyleSheet, ViewStyle, Animated } from "react-native";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";
import { fonts } from "@/theme/typography";

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: "filled" | "outline" | "circular";
  size?: number; // Tamanho para variante circular
  style?: ViewStyle;
  disabled?: boolean;
}

export function PrimaryButton({
  label,
  onPress,
  icon,
  variant = "filled",
  size = 160,
  style,
  disabled,
}: PrimaryButtonProps) {
  const { colors } = useAppTheme();
  const scale = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.94, useNativeDriver: true, speed: 40 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }).start();
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const isOutline = variant === "outline";
  const isCircular = variant === "circular";

    if (isCircular) {
    return (
      <Animated.View
        style={[
          styles.circularWrapper,
          {
            width: size,
            height: size,
            transform: [{ scale }],
          },
          style,
        ]}
      >
        <Pressable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          style={[
            styles.circularButton,
            {
              width: size,
              height: size,
              borderRadius: size / 2, // Metade exata para círculo perfeito
              backgroundColor: colors.accent,
              opacity: disabled ? 0.6 : 1,
            },
          ]}
        >
          {icon && (
            <Ionicons
              name={icon}
              size={26}
              color="#FFFFFF"
              style={styles.iconCircular}
            />
          )}
          <Text style={styles.labelCircular}>{label}</Text>
        </Pressable>
      </Animated.View>
    );
  }

  // Estilo Retangular Padrão
  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[
          styles.button,
          {
            backgroundColor: isOutline ? "transparent" : colors.accent,
            borderColor: colors.accent,
            borderWidth: isOutline ? 1.5 : 0,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={isOutline ? colors.accent : "#FFFFFF"}
            style={styles.icon}
          />
        )}
        <Text
          style={[
            styles.label,
            { color: isOutline ? colors.accent : "#FFFFFF" },
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
  },
  icon: {
    marginRight: 10,
  },
  label: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 12,
  },
  circularWrapper: {
    alignSelf: "center",
    marginVertical: 24,
    
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  circularButton: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden", 
  },
  iconCircular: {
    marginBottom: 4,
  },
  labelCircular: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 14,
    color: "#FFFFFF",
  },
});