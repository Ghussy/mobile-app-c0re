import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

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
    marginBottom: 30,
  },
  createAccountText: {
    textAlign: "center",
    paddingVertical: 17,
    fontSize: 20,
    color: "white",
  },
});

export default Button;
