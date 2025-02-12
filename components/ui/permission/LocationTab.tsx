import { StyleSheet, View, Image, Text } from "react-native";
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
          source={require("@/assets/images/location.png")}
          style={styles.iconImage}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.tabText}>Location</Text>
        <Text style={[styles.tabText, { color: "#A1A1AA" }]}>
          Location access lets us log activities for you automatically.
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
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginVertical: 20,
  },
  imageContainer: {
    justifyContent: "center",
    alignContent: "center",
  },
  iconImage: {
    width: 26,
    height: 25,
    marginRight: 18,
  },
});

export default Tab;
