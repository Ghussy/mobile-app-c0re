import React from "react";
import {
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
} from "react-native";
import axios from "axios";
import * as WebBrowser from "expo-web-browser";

const Button = () => {
  const signIn = async () => {
    try {
      const response = await axios.get("http://10.0.2.2:5000/login");
      const result = await WebBrowser.openAuthSessionAsync(
        response.data.authUrl
      );
      console.log(result);
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
    marginTop: 30,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 17,
  },
  discordIcon: {
    height: 29,
    width: 40,
    marginRight: 14,
  },
  discordLoginText: {
    fontSize: 15,
    color: "black",
  },
});

export default Button;
