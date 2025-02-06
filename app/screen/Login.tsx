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
import Button from "../../components/ui/Login/Button";
import Discord from "../../components/ui/Login/DiscordButton";

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
    maxHeight: height * 0.4, // Ensures image container doesn't exceed 40% of the screen
  },
  image: {
    width: width * 0.6, // Keeps image responsive
    height: "100%", // Makes sure it fits its container
    maxHeight: 200, // Prevents it from getting too big
    resizeMode: "contain",
  },
  formContainer: {
    width: width,
    height: height * 0.5,
    backgroundColor: "#101012",
    alignItems: "center",
    borderTopColor: "white",
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
    backgroundColor: "gray",
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
  },
  bottomFlare: {
    position: "absolute",
    zIndex: 0,
  },
});
