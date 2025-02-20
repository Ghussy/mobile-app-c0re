import { LinearGradient, Rect } from '@shopify/react-native-skia';
import Color from 'color';
import React, { useMemo } from 'react';

// Defining type for props
type BoundaryGradientProps = {
  mainColor: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

// Functional component for boundary gradient
export const BoundaryGradient: React.FC<BoundaryGradientProps> = React.memo(
  ({ x, y, width, height, mainColor }) => {
    const transparent = '#0B0B0D00';
    const solid = '#0B0B0D';

    // Memoizing the colors array
    const colors = useMemo(() => {
      return [solid, transparent, transparent, transparent, solid];
    }, [transparent, solid]);

    // Returning a Rect component enclosing a LinearGradient
    return (
      <Rect x={x} y={y} width={width} height={height}>
        <LinearGradient
          colors={colors}
          start={{
            x: 0,
            y: 0,
          }}
          end={{
            x: width,
            y: 0,
          }}
        />
      </Rect>
    );
  },
);
