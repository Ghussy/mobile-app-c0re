import { TouchableOpacity, Text, StyleSheet, Dimensions } from "react-native";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

const Button = () => {
  const router = useRouter();
  return (
    <TouchableOpacity
      style={styles.createAccountButton}
      onPress={() => {
        console.log("Create account pressed");
        router.push("/(auth)/Permission");
      }}
    >
      <Text style={styles.createAccountText}>Create account</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  createAccountButton: {
    backgroundColor: "#27272a",
    borderRadius: 5,
    width: "100%",
    justifyContent: "center",
    marginBottom: height * 0.04,
  },
  createAccountText: {
    textAlign: "center",
    paddingVertical: height * 0.02,
    fontSize: height * 0.02,
    color: "white",
  },
});

export default Button;
