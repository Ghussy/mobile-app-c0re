import { View, Text, Image, StyleSheet, Dimensions } from "react-native";
const { width, height } = Dimensions.get("window");

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
    marginHorizontal: width * 0.02,
  },
  orText: {
    color: "white",
    fontSize: height * 0.02,
  },
});

export default Button;
