// SkiaNumber.tsx
import React, { useMemo, useEffect } from 'react';
import { useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useDerivedValue,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
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
} from '@shopify/react-native-skia';

// Adjust the path as needed to your font asset.
const OrbitronBold = require('@/assets/fonts/Orbitron-Bold.ttf');

interface SkiaNumberProps {
  /** The text (or number) to display */
  text: string;
  /** The height of the component (width will be full window width) */
  size?: number;
}

export const SkiaNumber: React.FC<SkiaNumberProps> = ({ text, size = 200 }) => {
  const { width: windowWidth } = useWindowDimensions();
  const font = useFont(OrbitronBold, 175);
  const rotation = useSharedValue(0);
  
  // Create a linear gradient used to fill the text.
  const linearGradient = useMemo(
    () => (
      <LinearGradient
        start={vec(0, 0)}
        end={vec(windowWidth * 0.57, size * 1.3)}
        positions={[0.3, 0.4, 0.5, 0.6, 0.7]}
        colors={['#CCE8FE', '#CDA0FF', '#8489F5', '#CDF1FF', '#B591E9']}
      />
    ),
    [windowWidth, size]
  );

  useEffect(() => {
    rotation.value = withRepeat(
      withDelay(
        5000,
        withTiming(1, {
          duration: 2000,
          easing: Easing.linear,
        })
      ),
      -1,
      false
    );
  }, []);

  const animatedRotation = useDerivedValue(() => {
    return [{ rotate: Math.PI * (rotation.value - 0.5) }];
  });

  // Return early if font isn't loaded, but after all hooks are declared
  if (!font) {
    return null;
  }

  return (
    <Animated.View style={{ width: windowWidth, height: size }}>
      <Canvas style={{ width: windowWidth, height: size }}>
        <Group
          // Apply a blur mask to the entire group.
          layer={<Paint><BlurMask blur={4} style="solid" /></Paint>}
        >
          {/* Create a mask from the text shape */}
          <Mask
            mask={
              <Text
                color="white"
                font={font}
                text={text}
                x={windowWidth / 2 - font.getTextWidth(text) / 2}
                y={size / 2 + font.getSize() / 4}
              />
            }
          >
            <Fill>{linearGradient}</Fill>
          </Mask>

          {/* Render the text stroke with the animated shine effect */}
          <Text
            font={font}
            text={text}
            x={windowWidth / 2 - font.getTextWidth(text) / 2}
            y={size / 2 + font.getSize() / 4}
            strokeWidth={2}
            style="stroke"
          >
            <SweepGradient
              c={vec(windowWidth / 3, size / 3)}
              colors={['transparent', 'white', 'white', 'transparent']}
              start={0}
              end={360 * 0.2}
              transform={animatedRotation}
            />
          </Text>
        </Group>
      </Canvas>
    </Animated.View>
  );
};
