import { StyleSheet, View, Text } from "react-native";

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
    marginTop: 40,
    marginBottom: 15,
    justifyContent: "center",
    alignContent: "center",
  },
  bottomText: {
    fontSize: 16,
    color: "#A1A1AA",
    textAlign: "center",
  },
});
