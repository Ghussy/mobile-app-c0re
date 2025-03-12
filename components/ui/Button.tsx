import { Pressable, StyleSheet, Text, ActivityIndicator } from "react-native";

interface ButtonProps {
  disabled?: boolean;
  onPress?: () => void | Promise<void>;
  buttonStyles?: object;
  textStyles?: object;
  children?: React.ReactNode;
  accessibilityLabel?: string;
  variant?: "primary" | "secondary" | "disabled";
  loading?: boolean;
}

const Button = ({
  disabled,
  onPress,
  buttonStyles,
  textStyles,
  children = "Continue",
  accessibilityLabel,
  variant = "primary",
  loading = false,
}: ButtonProps) => {
  const getButtonStyle = () => {
    if (disabled || loading)
      return [styles.buttonBase, styles.buttonDisabled, buttonStyles];
    switch (variant) {
      case "secondary":
        return [styles.buttonBase, styles.buttonSecondary, buttonStyles];
      case "disabled":
        return [styles.buttonBase, styles.buttonDisabled, buttonStyles];
      default:
        return [styles.buttonBase, styles.buttonPrimary, buttonStyles];
    }
  };

  return (
    <Pressable
      style={getButtonStyle()}
      disabled={disabled || loading}
      onPress={onPress}
      accessible
      accessibilityLabel={accessibilityLabel || "Button"}
    >
      {loading ? (
        <ActivityIndicator color="#fafafa" />
      ) : (
        <Text style={[styles.text, textStyles]}>{children}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  buttonBase: {
    height: 52,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
    backgroundColor: "#27272a",
    shadowColor: "rgba(0, 0, 0, 0.05)",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowRadius: 2,
    elevation: 2,
    shadowOpacity: 1,
  },
  buttonPrimary: {
    backgroundColor: "#27272a",
  },
  buttonSecondary: {
    backgroundColor: "#404040",
  },
  buttonDisabled: {
    backgroundColor: "#27272a",
    opacity: 0.5,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "Inter_500Medium",
    color: "#fafafa",
  },
});

export default Button;
