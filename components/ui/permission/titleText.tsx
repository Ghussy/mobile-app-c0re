import { StyleSheet, Text } from "react-native";
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
    marginBottom: 30,
    textAlign: "center",
  },
});
