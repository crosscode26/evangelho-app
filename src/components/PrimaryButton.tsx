import React from "react";
import { Pressable, Text, StyleSheet, ViewStyle, Animated } from "react-native";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";
import { useAppTheme } from "@/context/ThemeContext";
import { fonts } from "@/theme/typography";

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  icon?: keyof typeof Feather.glyphMap;
  variant?: "filled" | "outline";
  style?: ViewStyle;
  disabled?: boolean;
}

export function PrimaryButton({
  label,
  onPress,
  icon,
  variant = "filled",
  style,
  disabled,
}: PrimaryButtonProps) {
  const { colors } = useAppTheme();
  const scale = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 40 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }).start();
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const isOutline = variant === "outline";

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
          <Feather
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
    fontSize: 16,
  },
  circularWrapper: {
    alignSelf: "center",
    marginVertical: 32,
  },
  circularButton: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  iconCircular: {
    marginBottom: 6,
  },
  labelCircular: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 15,
  },
});
