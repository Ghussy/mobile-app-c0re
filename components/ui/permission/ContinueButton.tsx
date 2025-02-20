import { StyleSheet, TouchableOpacity, Text } from "react-native";
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
  },
  createAccountButtonEnable: {
    backgroundColor: "#636363",
    borderRadius: 5,
    width: "100%",
    justifyContent: "center",
  },
  createAccountText: {
    textAlign: "center",
    paddingVertical: 17,
    fontSize: 18,
    color: "white",
  },
});

export default Continue;

