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
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");

function signIn() {}

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundWrapper}>
        <View style={styles.headerContainer}>
          <Image
            source={require("../../assets/images/cross-flare.png")}
            style={styles.backgroundImage}
          />
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.logo}
            />
            <Image
              source={require("../../assets/images/c0re-lego.png")}
              style={styles.logoText}
            />
          </View>
        </View>
        <View 
          style={styles.authContainer}
        >
          <Text style={styles.loginTitle}>Login</Text>
          <TouchableOpacity 
            style={[styles.createAccountButton, { zIndex: 1 }]}
            onPress={() => {
              console.log('Create account pressed');
              router.push("/(auth)/permissions");
            }}
          >
            <Text style={styles.createAccountText}>skip</Text>
          </TouchableOpacity>
          <View style={styles.separatorContainer}>
            <Image
              source={require("../../assets/images/separator.png")}
              style={styles.separator}
            />
            <Text style={styles.orText}>Or</Text>
            <Image
              source={require("../../assets/images/separator.png")}
              style={styles.separator}
            />
          </View>
          <TouchableOpacity 
            style={[styles.discordLoginButton, { zIndex: 1 }]}
          >
            <Image
              source={require("../../assets/images/discord.png")}
              style={styles.discordIcon}
            />
            <Text style={styles.discordLoginText}>Login with Discord</Text>
          </TouchableOpacity>
          <Image
            source={require("../../assets/images/bottom-flare.png")}
            style={[styles.bottomFlare, { zIndex: 0 }]}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090b",
  },
  backgroundWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
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
  authContainer: {
    width: "100%",
    height: height * 0.5,
    backgroundColor: "#101012",
    alignItems: "center",
    borderTopColor: "#212123",
    borderTopWidth: 3,
    paddingVertical: height * 0.03,
    paddingHorizontal: width * 0.1,
    position: "relative",
  },
  loginTitle: {
    fontSize: height * 0.045,
    marginBottom: height * 0.03,
    color: "white",
  },
  createAccountButton: {
    backgroundColor: "#27272a",
    borderRadius: 5,
    width: "100%",
    justifyContent: "center",
    marginBottom: height * 0.04,
  },
  createAccountText: {
    textAlign: "center",
    paddingVertical: height * 0.02,
    fontSize: height * 0.02,
    color: "white",
  },
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
  discordLoginButton: {
    backgroundColor: "white",
    borderRadius: 5,
    width: "100%",
    justifyContent: "center",
    marginTop: height * 0.04,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: height * 0.02,
  },
  discordIcon: {
    height: height * 0.035,
    width: width * 0.1,
    marginRight: width * 0.03,
  },
  discordLoginText: {
    fontSize: height * 0.02,
    color: "black",
  },
  bottomFlare: {
    position: "absolute",
    zIndex: 3,
    width: "150%",
    height: height * 0.4,
    bottom: 0,
  },
});
