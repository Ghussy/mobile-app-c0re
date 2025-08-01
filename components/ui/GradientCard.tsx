import { View, StyleSheet, ViewStyle, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";

interface GradientCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  gradientColors?: readonly [string, string, ...string[]];
  gradientLocations?: readonly [number, number, ...number[]];
  onPress?: () => void;
}

export const GradientCard: React.FC<GradientCardProps> = ({
  children,
  style,
  gradientColors = [
    "rgba(255, 255, 255, 0.2)",
    "rgba(255, 255, 255, 0.05)",
    "rgba(255, 255, 255, 0.02)",
  ] as const,
  gradientLocations = [0, 0.5, 1] as const,
  onPress,
}) => {
  return (
    <Pressable onPress={onPress} style={[styles.container, style]}>
      <LinearGradient
        colors={gradientColors}
        style={styles.gradientBorder}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        locations={gradientLocations}
      />
      <View style={styles.content}>{children}</View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    position: "relative",
    overflow: "hidden",
  },
  gradientBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 14,
  },
  content: {
    backgroundColor: "rgba(9, 9, 11, 0.7)",
    borderRadius: 13,
    padding: 20,
    margin: 2, // Creates space for the gradient border
  },
});
