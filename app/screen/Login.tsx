import React from "react";
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Text,
  TouchableOpacity,
} from "react-native";

const { width, height } = Dimensions.get("window");

function signIn() {}

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.backgroundContainer}>
        <View style={styles.imageContainer}>
          <Image
            source={require("../../assets/images/cross-flare.png")}
            style={styles.image}
          />
          <View style={styles.logoHolder}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.logo}
            />
            <Image
              source={require("../../assets/images/c0re-lego.png")}
              style={styles.text}
            />
          </View>
        </View>
        <View style={styles.formContainer}>
          <Text style={styles.loginText}>Login</Text>
          <TouchableOpacity style={styles.signInButton}>
            <Text style={[styles.textButton, { color: "white" }]}>
              Create account
            </Text>
          </TouchableOpacity>
          <View style={styles.orContainer}>
            <Image
              source={require("../../assets/images/separator.png")}
              style={styles.separatorImage}
            />

            <Text style={styles.orText}>Or</Text>

            <Image
              source={require("../../assets/images/separator.png")}
              style={styles.separatorImage}
            />
          </View>

          <TouchableOpacity style={styles.discordButton}>
            <Image
              source={require("../../assets/images/discord.png")}
              style={styles.imaged}
            />
            <Text style={styles.textButton}>Login with Discord</Text>
          </TouchableOpacity>
          <Image
            source={require("../../assets/images/bottom-flare.png")}
            style={styles.bottomFlare}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#09090b", // Keeps background color consistent
  },
  backgroundContainer: {
    flex: 1, // Takes full height without forcing scroll
    justifyContent: "center",
    alignItems: "center",
  },
  imageContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    maxHeight: height * 0.4,
  },
  image: {
    width: "110%",
    height: "110%",
    transform: [{ rotate: "5deg" }, { translateY: -40 }],
  },
  formContainer: {
    width: width,
    height: height * 0.5,
    backgroundColor: "#101012",
    alignItems: "center",
    borderTopColor: "#212123",
    borderTopWidth: 3,
    paddingVertical: 30,
    paddingHorizontal: 40,
    position: "relative",
    zIndex: 1,
  },
  loginText: {
    fontSize: 35,
    marginBottom: 30,
    color: "white",
  },
  signInButton: {
    backgroundColor: "#27272a",
    borderRadius: 5,
    width: "100%",
    justifyContent: "center",
    marginBottom: 40,
  },
  textButton: {
    textAlign: "center",
    paddingVertical: 20,
    fontSize: 16,
  },
  orContainer: {
    flexDirection: "row",
  },
  orText: {},
  separatorImage: {},
  discordButton: {
    backgroundColor: "white",
    borderRadius: 5,
    width: "100%",
    justifyContent: "center",
    marginTop: 40,
    flexDirection: "row",
    alignItems: "center",
  },
  bottomFlare: {
    position: "absolute",
    zIndex: 3,
  },
  imaged: {
    height: 40,
    width: 57,
    marginRight: 10,
  },
  logoHolder: {
    marginTop: 20,
    justifyContent: "center",
    alignItems: "center",
    transform: [{ translateY: -20 }],
    position: "absolute",
  },
  logo: {
    height: 125,
    width: 125,
  },
  text: {
    marginTop: 15,
  },
});
