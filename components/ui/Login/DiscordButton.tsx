import React, { useState } from "react";
import {
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native";
import axios from "axios";
import * as WebBrowser from "expo-web-browser";
const { width, height } = Dimensions.get("window");

const Button = () => {
  const signIn = async () => {
    try {
      const response = await axios.get("http://10.0.2.2:5000/login");
      console.log(response);
      const result = await WebBrowser.openAuthSessionAsync(
        response.data.authUrl
      );
      if (result.type === "dismiss") {
        console.log("check");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <TouchableOpacity style={styles.discordLoginButton} onPress={signIn}>
      <Image
        source={require("@/assets/images/discord.png")}
        style={styles.discordIcon}
      />
      <Text style={styles.discordLoginText}>Login with Discord</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
});

export default Button;
