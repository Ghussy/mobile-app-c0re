import React, { useState } from "react";

import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundWrapper}>
        <View style={styles.authContainer}>
        </View>
        <Image
            source={require("@/assets/images/bottom-flare.png")}
            style={styles.bottomFlare}
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
    position: "relative",
  },
  authContainer: {
    width: "100%",
    position: "absolute",
    backgroundColor: "#101012",
    alignItems: "center",
    borderTopColor: "#212123",
    borderTopWidth: 3,
    height: height * 0.85,
    paddingVertical: height * 0.03,
    paddingHorizontal: width * 0.1,
    bottom: 0,
  },
  bottomFlare: {
    position: "absolute",
    zIndex: 3,
    width: "150%",
    height: height * 0.4,
    bottom: 0,
  },
});
