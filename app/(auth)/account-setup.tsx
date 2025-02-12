import React, { useState } from "react";
import { View, Image, StyleSheet, SafeAreaView, Text, TextInput, KeyboardAvoidingView, TouchableOpacity} from "react-native";

export default function HomeScreen() {
  const [name, setName] = useState("");

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <View style={styles.wrapper}>
        <View style={styles.authSection}>
          <View style={styles.infoContainer}>
            <Text style={styles.title}>Help others recognize you!</Text>
            <Text style={styles.description}>
              Since Discord usernames aren’t always clear, please provide your real name.
            </Text>
            
            <View style={styles.userInfoWrapper}>
              <Image source={require("@/assets/images/placeholder.jpeg")} style={styles.profileImage} />
              <View style={styles.discordInfo}>
                <Image source={require("@/assets/images/discord-gray-icon.png")} style={styles.discordIcon} />
                <Text style={styles.userName}>Hussy</Text>
              </View>
            </View>
            
            <TextInput
              style={styles.input}
              onChangeText={setName}
              value={name}
              placeholder="Enter your name"
              placeholderTextColor="#A1A1AA"
            />
          </View>

          {/* <TouchableOpacity disabled={name.length < 1} style={styles.submitButton}>
            <Text style={styles.buttonText}>Finish</Text>
          </TouchableOpacity> */}

          <Image source={require("@/assets/images/bottom-flare.png")} style={styles.backgroundFlare} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090b",
  },
  wrapper: {
    flex: 1,
  },
  authSection: {
    width: "100%",
    backgroundColor: "#101012",
    alignItems: "center",
    borderTopColor: "#212123",
    borderTopWidth: 3,
    height: 750,
    paddingVertical: 30,
    paddingHorizontal: 20,
    bottom: 0,
    marginTop: 120
  },
  backgroundFlare: {
    position: "absolute",
    zIndex: 3,
    width: "150%",
    height: 340,
    bottom: 0,
  },
  infoContainer: {
    width: 325,
    alignItems: "center",
  },
  title: {
    color: "white",
    fontSize: 25,
    textAlign: "center",
    marginVertical: 20,
  },
  description: {
    color: "#A1A1AA",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 35,
  },
  input: {
    backgroundColor: "black",
    color: "#A1A1AA",
    borderRadius: 7,
    borderColor: "#212123",
    borderWidth: 1,
    width: "100%",
    marginTop: 30,
    height: 55,
    paddingLeft: 15,
  },
  discordInfo: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
  },
  discordIcon: {
    height: "100%",
    width: 20,
    opacity: 0.4,
    marginRight: 5,
  },
  userName: {
    color: "#A1A1AA",
    textAlign: "center",
  },
  profileImage: {
    height: 100,
    width: 100,
    borderRadius: 100,
    marginBottom: 5,
  },
  userInfoWrapper: {
    alignItems: "center",
  },
  submitButton: {
    backgroundColor: "black",
    width: "100%",
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 7,
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
});
