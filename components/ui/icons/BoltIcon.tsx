import React from "react";
import Svg, { Path } from "react-native-svg";

interface BoltIconProps {
  width?: number;
  height?: number;
  color?: string;
  opacity?: number;
  style?: any;
}

export default function BoltIcon({
  width = 9,
  height = 14,
  color = "#FFEA72",
  opacity = 1,
  style,
}: BoltIconProps) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 9 14"
      opacity={opacity}
      style={style}
    >
      <Path
        d="M3.0981 8.544H0.567731C0.337724 8.544 0.17101 8.44387 0.0675916 8.24361C-0.0358272 8.04334 -0.0205688 7.85126 0.113367 7.66736L4.88504 0.766756C4.9715 0.64547 5.07888 0.565083 5.20716 0.525594C5.33545 0.486106 5.47108 0.492311 5.61406 0.54421C5.75703 0.596109 5.86017 0.681855 5.92346 0.801449C5.98676 0.921042 6.00993 1.05164 5.99298 1.19323L5.39705 6.00546H8.43688C8.67423 6.00546 8.84236 6.11349 8.94126 6.32955C9.04072 6.5456 9.01388 6.74587 8.86073 6.93033L3.55077 13.2792C3.46035 13.3864 3.35128 13.4549 3.22356 13.4848C3.09527 13.5142 2.96868 13.5009 2.84379 13.4451C2.7189 13.3898 2.62339 13.306 2.55727 13.1938C2.49171 13.0815 2.4677 12.9546 2.48522 12.813L3.0981 8.544Z"
        fill={color}
      />
    </Svg>
  );
}
