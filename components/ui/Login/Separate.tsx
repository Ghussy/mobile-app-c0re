import { View, Text, Image, StyleSheet } from "react-native";

const Button = () => {
  return (
    <View style={styles.separatorContainer}>
      <Image
        source={require("@/assets/images/separator.png")}
        style={styles.separator}
      />
      <Text style={styles.orText}>Or</Text>
      <Image
        source={require("@/assets/images/separator.png")}
        style={styles.separator}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  separator: {
    flex: 1,
    height: 1,
    backgroundColor: "gray",
    marginHorizontal: 10,
  },
  orText: {
    color: "white",
    fontSize: 15,
  },
});

export default Button;
