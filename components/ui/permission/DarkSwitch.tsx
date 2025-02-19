import React, { useRef, useEffect } from "react";
import { Pressable, Animated, StyleSheet } from "react-native";

type SwitchProps = {
  isOn: boolean;
  onToggle: () => void;
};

const Switch = ({ isOn, onToggle }: SwitchProps) => {
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: isOn ? 23 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isOn]);

  return (
    <Pressable
      onPress={onToggle}
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
    width: 47,
    height: 25,
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
    height: 21,
    borderRadius: 10,
    backgroundColor: "#000",
  },
});

export default Switch;
