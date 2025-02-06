import React, { useState } from "react";
import { View, TouchableOpacity, Text, Image, StyleSheet } from "react-native";
import axios from "axios";
import * as WebBrowser from "expo-web-browser";
// Q-JhQCzVFX32YdesGEtVo6xsHeUaMAh7

const Button = () => {
  const [message, setMessage] = useState(""); // State to store the message

  // Async function to handle the API call
  const signIn = async () => {
    try {
      const response = await axios.get("http://10.0.2.2:5000/login");
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
    <View>
      <TouchableOpacity style={styles.button} onPress={signIn}>
        <Image
          source={require("../../../assets/images/discord-white-icon.webp")}
          style={styles.image}
        />
        <Text style={styles.text}>Sign In with Discord</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 15,
    borderWidth: 4,
    borderColor: "black",
    backgroundColor: "#5865F2",
    flexDirection: "row",
    alignItems: "center",
    opacity: 0.9,
  },
  text: {
    fontSize: 25,
    color: "white",
    marginHorizontal: 10,
  },
  image: {
    height: 50,
    width: 60,
    marginLeft: 5,
  },
});

export default Button;
