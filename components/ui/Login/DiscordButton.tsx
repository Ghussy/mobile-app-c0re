import React from "react";
import { TouchableOpacity, Text, Image, StyleSheet } from "react-native";

import { signInWithDiscord } from "@/lib/supabase";

const Button = () => {
  const signIn = async () => {
    try {
      await signInWithDiscord();
    } catch (e) {
      console.error(e);
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
