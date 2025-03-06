import {
  Canvas,
  Circle,
  Paint,
  vec,
  RadialGradient,
  Group,
  BlurMask,
  RoundedRect,
} from "@shopify/react-native-skia";
import { View } from "react-native";
import React from "react";

interface ProgressDotProps {
  active?: boolean;
}

export const ProgressDot: React.FC<ProgressDotProps> = ({ active }) => {
  if (!active) {
    return (
      <View
        style={{
          width: 34,
          height: 34,
          borderWidth: 1,
          borderColor: "#333",
          borderRadius: 8,
        }}
      />
    );
  }

  // Size for the active dot
  const dotSize = 18;
  const canvasSize = 28; // Larger canvas to show glow
  const center = canvasSize / 2;
  const offset = (canvasSize - dotSize) / 2; // To center the dot in canvas

  return (
    <Canvas style={{ width: canvasSize, height: canvasSize }}>
      {/* Outer glow effect */}
      <Group>
        <BlurMask blur={8} style="solid" />
        <RoundedRect
          x={offset}
          y={offset}
          width={dotSize}
          height={dotSize}
          r={4}
          color="rgba(255, 255, 255, 0.4)"
        />
      </Group>

      {/* Main dot with radial gradient */}
      <RoundedRect x={offset} y={offset} width={dotSize} height={dotSize} r={4}>
        <Paint>
          <RadialGradient
            c={vec(center, center)}
            r={dotSize * 0.7} // Larger radius to ensure gradient fills the square
            colors={["white", "#3080BD"]}
            positions={[0.275, 0.865]}
          />
        </Paint>
      </RoundedRect>
    </Canvas>
  );
};
