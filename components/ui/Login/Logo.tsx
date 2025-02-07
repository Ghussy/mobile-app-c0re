import { StyleSheet, Text, View, Image } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.logoHolder}>
      <Image
        source={require("../../../assets/images/logo.png")}
        style={styles.logo}
      />
      <Image
        source={require("../../../assets/images/c0re-lego.png")}
        style={styles.text}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  logoHolder: {
    marginTop: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    height: 125,
    width: 125,
  },
  text: {
    marginTop: 15,
  },
});
