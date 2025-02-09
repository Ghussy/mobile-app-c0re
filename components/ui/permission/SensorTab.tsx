import { StyleSheet, Dimensions, View, Image, Text } from "react-native";
const { height, width } = Dimensions.get("window");
import DarkSwitch from "@/components/ui/permission/DarkSwitch";

type TabProps = {
  Enable: boolean;
  Activate: () => void;
};

const Tab = ({ Enable, Activate }: TabProps) => {
  return (
    <View style={styles.tabContainer}>
      <View style={styles.imageContainer}>
        <Image
          source={require("@/assets/images/sensor.png")}
          style={styles.iconImage}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.tabText}>Motion Sensors</Text>
        <Text style={[styles.tabText, { color: "#A1A1AA" }]}>
          We use motion sensors to optimize tracking accuracy and save battery
          power.
        </Text>
      </View>
      <DarkSwitch isOn={Enable} onToggle={Activate} />
    </View>
  );
};

const styles = StyleSheet.create({
  tabText: {
    fontSize: 15,
    color: "white",
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
  imageContainer: {
    justifyContent: "center",
    alignContent: "center",
  },
  iconImage: {
    width: width * 0.06,
    height: height * 0.03,
    marginRight: width * 0.04,
  },
});

export default Tab;
