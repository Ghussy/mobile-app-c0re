import { StyleSheet, Dimensions, View, Image } from "react-native";
const { height } = Dimensions.get("window");

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
    maxHeight: height * 0.4,
  },
  backgroundImage: {
    width: "110%",
    height: "110%",
    transform: [{ rotate: "5deg" }, { translateY: -height * 0.05 }],
  },
  logoContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    transform: [{ translateY: -height * 0.02 }],
  },
  logo: {
    height: height * 0.15,
    width: height * 0.15,
  },
  logoText: {
    marginTop: height * 0.02,
  },
});
