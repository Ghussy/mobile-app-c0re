// SkiaNumber.tsx
import React, { useMemo, useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useDerivedValue,
  withRepeat,
  withDelay,
  withTiming,
  Easing,
} from "react-native-reanimated";
import {
  Canvas,
  Group,
  Mask,
  Text,
  Fill,
  LinearGradient,
  SweepGradient,
  useFont,
  vec,
  Paint,
  BlurMask,
} from "@shopify/react-native-skia";

// Adjust the path as needed to your font asset.
const OrbitronBold = require("@/assets/fonts/Orbitron-Bold.ttf");

interface SkiaNumberProps {
  /** The text (or number) to display */
  text: string;
  /** The font size to use for the number */
  size?: number;
}

export const SkiaNumber: React.FC<SkiaNumberProps> = ({ text, size = 40 }) => {
  const font = useFont(OrbitronBold, size);
  const rotation = useSharedValue(0);

  // Calculate dimensions based on font size and text
  const getTextWidth = () => {
    if (!font) return size * text.length * 0.7; // Fallback estimate
    return font.getTextWidth(text); // Get exact text width
  };

  // Add consistent padding based on font size
  const padding = size * 0;
  const textWidth = getTextWidth();
  const canvasWidth = textWidth + padding * 2; // Add padding on both sides
  const canvasHeight = size * 1;

  // Create a linear gradient used to fill the text.
  const linearGradient = useMemo(() => {
    return (
      <LinearGradient
        start={vec(0, 0)}
        end={vec(canvasWidth, canvasHeight)}
        positions={[0, 0.25, 0.5, 0.75, 1]}
        colors={["#CCE8FE", "#CDA0FF", "#8489F5", "#CDF1FF", "#B591E9"]}
      />
    );
  }, [canvasWidth, canvasHeight]);

  useEffect(() => {
    rotation.value = withRepeat(
      withDelay(
        1000,
        withTiming(1, {
          duration: 1500,
          easing: Easing.linear,
        })
      ),
      -1,
      false
    );
  }, []);

  const animatedRotation = useDerivedValue(() => {
    // Full rotation to ensure the shine sweeps across the entire text
    return [{ rotate: Math.PI * 2 * rotation.value }];
  });

  // Return early if font isn't loaded, but after all hooks are declared
  if (!font) {
    return null;
  }

  return (
    <View style={{ alignItems: "center", height: canvasHeight }}>
      <Animated.View style={{ width: canvasWidth, height: canvasHeight }}>
        <Canvas style={{ width: canvasWidth, height: canvasHeight }}>
          <Group
            // Apply a blur mask to the entire group.
            layer={
              <Paint>
                <BlurMask blur={2} style="solid" />
              </Paint>
            }
          >
            {/* Create a mask from the text shape */}
            <Mask
              mask={
                <Text
                  color="white"
                  font={font}
                  text={text}
                  x={padding} // Position text with consistent padding
                  y={canvasHeight / 2 + font.getSize() / 3}
                />
              }
            >
              <Fill>{linearGradient}</Fill>
            </Mask>

            {/* Render the text stroke with the animated shine effect */}
            <Text
              font={font}
              text={text}
              x={padding} // Position text with consistent padding
              y={canvasHeight / 2 + font.getSize() / 3}
              strokeWidth={1}
              style="stroke"
            >
              <SweepGradient
                // Position the center outside the text area to create a sweeping effect
                c={vec(padding - size * 0.4, canvasHeight / 6)}
                colors={[
                  "transparent",
                  "transparent",
                  "transparent",
                  "white",
                  "white",
                  "transparent",
                  "transparent",
                  "transparent",
                ]}
                start={0}
                end={360 * 0.6} // Significantly increase the sweep angle for better coverage
                transform={animatedRotation}
              />
            </Text>
          </Group>
        </Canvas>
      </Animated.View>
    </View>
  );
};
