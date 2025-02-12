import React, { useState } from "react";
import Location from "@/components/ui/permission/LocationTab";
import Sensor from "@/components/ui/permission/SensorTab";
import BottomText from "@/components/ui/permission/BottomInfo";
import ContinueButton from "@/components/ui/permission/ContinueButton";
import TitleText from "@/components/ui/permission/titleText";

import { View, Image, StyleSheet, SafeAreaView } from "react-native";

export default function HomeScreen() {
  const [SensorEnabled, setSensorEnabled] = useState(false);
  const [LocationEnabled, setLocationEnabled] = useState(false);
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundWrapper}>
        <View style={[styles.authContainer, {zIndex: 2}]}>
          <TitleText />

          <Sensor
            Enable={SensorEnabled}
            Activate={() => setSensorEnabled(!SensorEnabled)}
          />

          <Location
            Enable={LocationEnabled}
            Activate={() => setLocationEnabled(!LocationEnabled)}
          />

          <BottomText />

          <ContinueButton
            sensorCheck={SensorEnabled}
            locationCheck={LocationEnabled}
          />
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
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  authContainer: {
    width: "100%",
    position: "absolute",
    backgroundColor: "rgba(16, 16, 18, 0.1)",
    alignItems: "center",
    borderTopColor: "#212123",
    borderTopWidth: 3,
    height: 750,
    paddingVertical: 30,
    paddingHorizontal: 20,
    bottom: 0,
  },
  bottomFlare: {
    position: "absolute",
    zIndex: 0,
    width: "150%",
    height: 340,
    bottom: 0,
  },
});
