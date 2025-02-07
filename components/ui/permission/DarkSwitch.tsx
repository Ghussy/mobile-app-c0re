import React, { useState, useRef } from "react";
import {
  View,
  Pressable,
  Animated,
  StyleSheet,
  Dimensions,
} from "react-native";
const { width, height } = Dimensions.get("window");

type SwitchProps = {
  isOn: boolean;
  onToggle: () => void;
};

const Switch = ({ isOn, onToggle }: SwitchProps) => {
  const translateX = useRef(new Animated.Value(0)).current;

  const toggleSwitch = () => {
    Animated.timing(translateX, {
      toValue: isOn ? 0 : 23,
      duration: 200,
      useNativeDriver: true,
    }).start();
    onToggle();
  };

  return (
    <Pressable
      onPress={toggleSwitch}
      style={[styles.switchContainer, isOn && styles.switchOn]}
    >
      <Animated.View
        style={[styles.switchThumb, { transform: [{ translateX }] }]}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  switchContainer: {
    width: width * 0.11,
    height: height * 0.03,
    borderRadius: 20,
    backgroundColor: "#1a1a1a",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  switchOn: {
    backgroundColor: "#FAFAFA",
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#000",
  },
});

export default Switch;
