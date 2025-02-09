import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function PermissionsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Location Tracking</Text>
      <Text style={styles.description}>
        This app will track your location in the background
      </Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => router.replace("/(tabs)/leaderboard")}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#09090b",
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: "white",
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#e0e0e0',
    textAlign: 'center',
    marginHorizontal: 30,
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#27272a",
    padding: 15,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 