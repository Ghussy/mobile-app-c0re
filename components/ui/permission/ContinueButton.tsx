import { StyleSheet, Dimensions, TouchableOpacity, Text } from "react-native";
const { height } = Dimensions.get("window");
import { useRouter } from "expo-router";

type ContinueProp = {
  locationCheck: boolean;
  sensorCheck: boolean;
};

const Continue = ({ locationCheck, sensorCheck }: ContinueProp) => {
    const router = useRouter();
  const userPress = () => {
    if (locationCheck && sensorCheck) {
      console.log("Access All");
      router.push("/(tabs)/leaderboard");
    }
  };

  return (
    <TouchableOpacity
      style={
        locationCheck && sensorCheck
          ? styles.createAccountButtonEnable
          : styles.createAccountButtonDisable
      }
      onPress={userPress}
    >
      <Text style={styles.createAccountText}>Continue</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
});

export default Continue;
