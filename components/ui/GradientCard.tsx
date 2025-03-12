import { View, StyleSheet, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";

interface GradientCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  gradientColors?: string[];
  gradientLocations?: number[];
}

export const GradientCard: React.FC<GradientCardProps> = ({
  children,
  style,
  gradientColors = [
    "rgba(255, 255, 255, 0.2)",
    "rgba(255, 255, 255, 0.05)",
    "rgba(255, 255, 255, 0.02)",
  ],
  gradientLocations = [0, 0.5, 1],
}) => {
  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={gradientColors}
        style={styles.gradientBorder}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        locations={gradientLocations}
      />
      <View style={styles.content}>{children}</View>
    </View>
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
    margin: 1, // Creates space for the gradient border
  },
});
