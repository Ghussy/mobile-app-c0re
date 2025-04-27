import React from "react";
import { View, Image, StyleSheet, SafeAreaView, Text } from "react-native";

import DiscordButton from "@/components/ui/Login/DiscordButton";
import Logo from "@/components/ui/Login/Logo";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundWrapper}>
        <Logo />
        <View style={[styles.authContainer, { zIndex: 2 }]}>
          <Text style={styles.loginTitle}>Login</Text>
          <DiscordButton />
        </View>
        <Image
          source={require("@/assets/images/bottom-flare.png")}
          style={[styles.bottomFlare]}
        />
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
    height: 470,
    backgroundColor: "rgba(16, 16, 18, 0.1)",
    alignItems: "center",
    borderTopColor: "#212123",
    borderTopWidth: 3,
    paddingVertical: 50,
    paddingHorizontal: 25,
    position: "relative",
  },
  loginTitle: {
    fontSize: 35,
    fontFamily: "Inter-medium",
    marginBottom: 25,
    color: "white",
  },
  bottomFlare: {
    position: "absolute",
    zIndex: 0,
    width: "150%",
    height: 340,
    bottom: 0,
  },
});
