import React from "react";
import { View, StyleSheet } from "react-native";
import { ProgressDot } from "./ProgressDot";

interface DotProgressBarProps {
  total: number;
  completed: number;
  style?: any;
}

export const DotProgressBar: React.FC<DotProgressBarProps> = ({
  total = 7,
  completed = 0,
  style,
}) => {
  const containerStyle = [
    styles.container,
    total === 1 && styles.singleDotContainer,
    total === 2 && styles.twoDotContainer,
    total === 3 && styles.threeDotContainer,
    style,
  ];

  return (
    <View style={containerStyle}>
      <View style={styles.dotsContainer}>
        {Array.from({ length: total }, (_, index) => (
          <React.Fragment key={index}>
            <ProgressDot active={index < completed} />
            {index < total - 1 && <View style={styles.line} />}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 20,
  },
  singleDotContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  twoDotContainer: {
    paddingHorizontal: 80,
  },
  threeDotContainer: {
    paddingHorizontal: 60,
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  line: {
    height: 2,
    backgroundColor: "#333",
    flex: 1,
    marginHorizontal: 4,
  },
});
