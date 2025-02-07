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

const { width, height } = Dimensions.get("window");

function signIn() {}

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundWrapper}>
        <View style={styles.authContainer}>
          <Text style={styles.titleText}>
            c0re requires these{"\n"} permissions to work
          </Text>
          <View style={styles.tabContainer}>
            <Image
              source={require("../../assets/images/sensor.png")}
              style={styles.iconImge}
            />
            <Text>
              Motion Sensors{"\n"}
              We use motion sensors to optimize tracking accuracy and save
              battery power.
            </Text>
            <Image
              source={require("../../assets/images/switch.png")}
              style={styles.iconImge}
            />
          </View>
          <View style={styles.tabContainer}>
            <Image
              source={require("../../assets/images/location.png")}
              style={styles.iconImge}
            />
            <Text>
              Location{"\n"}
              Location access lets us log activities for you automatically.
            </Text>
            <Image
              source={require("../../assets/images/switch.png")}
              style={styles.iconImge}
            />
          </View>
          <Text>
            Your location data never leaves your device.{"\n"}Only you can
            access it
          </Text>
          <TouchableOpacity style={styles.createAccountButton}>
            <Text style={styles.createAccountText}>Continue</Text>
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
  titleText: {
    fontSize: 30,
    color: "white",
  },
  tabContainer: {
    borderRadius: 2,
    borderWidth: 2,
    borderColor: "#212123",
    flexDirection: "row",
  },
  iconImge: {
    width: 50,
    height: 50,
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
  bottomFlare: {
    position: "absolute",
    zIndex: 3,
    width: "150%",
    height: height * 0.4,
    bottom: 0,
  },
});
