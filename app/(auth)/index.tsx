import React from "react";
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Text,
} from "react-native";
import { useRouter } from "expo-router";

const { width, height } = Dimensions.get("window");
import DiscordButton from "@/components/ui/Login/DiscordButton";
import CreateButton from "@/components/ui/Login/CreateAccountButton";
import Logo from "@/components/ui/Login/Logo";

import Separator from "@/components/ui/Login/Separate";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundWrapper}>
        <Logo />
        <View style={styles.authContainer}>
          {/* Login Sign */}
          <Text style={styles.loginTitle}>Login</Text>

          {/* Create Button  */}
          <CreateButton />

          {/* Separate Buttons  */}
          <Separator />

          {/* Discord Button */}
          <DiscordButton />

          {/* Background Flare */}
          <Image
            source={require("@/assets/images/bottom-flare.png")}
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
  bottomFlare: {
    position: "absolute",
    zIndex: 3,
    width: "150%",
    height: height * 0.4,
    bottom: 0,
  },
});
