import React, { useState } from "react";
import DarkSwitch from "@/components/ui/permission/DarkSwitch";
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Text,
  TouchableOpacity,
  Switch,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function HomeScreen() {
  const [SensorEnabled, setSensorEnabled] = useState(false);
  const [LocationEnabled, setLocationEnabled] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundWrapper}>
        <View style={styles.authContainer}>
          <Text style={styles.titleText}>
            c0re requires these{"\n"} permissions to work
          </Text>

          {/* Motion Sensors Permission */}
          <View style={styles.tabContainer}>
            <View style={styles.imageContainer}>
              <Image
                source={require("../../assets/images/sensor.png")}
                style={styles.iconImage}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.tabText}>Motion Sensors</Text>
              <Text style={[styles.tabText, { color: "#A1A1AA" }]}>
                We use motion sensors to optimize tracking accuracy and save
                battery power.
              </Text>
            </View>
            <DarkSwitch
              isOn={SensorEnabled}
              onToggle={() => setSensorEnabled(!SensorEnabled)}
            />
          </View>

          {/* Location Permission */}
          <View style={styles.tabContainer}>
            <View style={styles.imageContainer}>
              <Image
                source={require("../../assets/images/location.png")}
                style={styles.iconImage}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.tabText}>Location</Text>
              <Text style={[styles.tabText, { color: "#A1A1AA" }]}>
                Location access lets us log activities for you automatically.
              </Text>
            </View>
            <DarkSwitch
              isOn={LocationEnabled}
              onToggle={() => setLocationEnabled(!LocationEnabled)}
            />
          </View>

          {/* Bottom Information */}
          <View style={styles.bottomTextContainer}>
            <Text style={styles.bottomText}>
              Your location data never leaves your device.{"\n"}Only you can
              access it.
            </Text>
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={[
              SensorEnabled && LocationEnabled
                ? styles.createAccountButtonEnable
                : styles.createAccountButtonDisable,
            ]}
          >
            <Text style={styles.createAccountText}>Continue</Text>
          </TouchableOpacity>

          {/* Background Flare */}
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
    marginBottom: height * 0.05,
    textAlign: "center",
  },
  bottomTextContainer: {
    marginTop: height * 0.15,
    marginBottom: height * 0.02,
    justifyContent: "center",
    alignContent: "center",
  },
  tabContainer: {
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#212123",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: width * 0.04,
    paddingVertical: width * 0.05,
    marginVertical: height * 0.023,
  },
  iconImage: {
    width: width * 0.06,
    height: height * 0.03,
    marginRight: width * 0.04,
  },
  createAccountButtonDisable: {
    backgroundColor: "#27272a",
    borderRadius: 5,
    width: "100%",
    justifyContent: "center",
    marginBottom: height * 0.04,
  },
  createAccountButtonEnable: {
    backgroundColor: "#636363",
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
  imageContainer: {
    justifyContent: "center",
    alignContent: "center",
  },
  bottomFlare: {
    position: "absolute",
    zIndex: 3,
    width: "150%",
    height: height * 0.4,
    bottom: 0,
  },
  tabText: {
    fontSize: 15,
    color: "white",
  },
  bottomText: {
    fontSize: 16,
    color: "#A1A1AA",
    textAlign: "center",
  },
});
