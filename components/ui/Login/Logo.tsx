import { StyleSheet, View, Image } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.headerContainer}>
      <Image
        source={require("@/assets/images/cross-flare.png")}
        style={styles.backgroundImage}
      />
      <View style={styles.logoContainer}>
        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.logo}
        />
        <Image
          source={require("@/assets/images/c0re-lego.png")}
          style={styles.logoText}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    maxHeight: 400,
  },
  backgroundImage: {
    width: "110%",
    height: "110%",
    transform: [{ rotate: "5deg" }, { translateY: -40 }],
  },
  logoContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    transform: [{ translateY: -10 }],
  },
  logo: {
    height: 150,
    width: 150,
  },
  logoText: {
    marginTop: 15,
  },
});
