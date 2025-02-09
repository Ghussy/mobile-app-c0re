import { StyleSheet, Dimensions, View, Text } from "react-native";
const { height } = Dimensions.get("window");

export default function BottomInfo() {
  return (
    <View style={styles.bottomTextContainer}>
      <Text style={styles.bottomText}>
        Your location data never leaves your device.{"\n"}Only you can access
        it.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomTextContainer: {
    marginTop: height * 0.15,
    marginBottom: height * 0.02,
    justifyContent: "center",
    alignContent: "center",
  },
  bottomText: {
    fontSize: 16,
    color: "#A1A1AA",
    textAlign: "center",
  },
});
