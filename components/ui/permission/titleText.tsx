import { StyleSheet, Dimensions, Text } from "react-native";
const { height } = Dimensions.get("window");

export default function TitleText() {
  return (
    <Text style={styles.titleText}>
      c0re requires these{"\n"} permissions to work
    </Text>
  );
}
const styles = StyleSheet.create({
  titleText: {
    fontSize: 30,
    color: "white",
    marginBottom: height * 0.05,
    textAlign: "center",
  },
});
