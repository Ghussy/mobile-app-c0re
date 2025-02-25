import React, { useEffect } from "react";
import { SafeAreaView, View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Button from "@/components/ui/Button";
import ToggleCard from "@/components/ui/toggle-card";
import { pickPlace } from "react-native-place-picker";
import { getCurrentLocation } from "@/providers/LocationReporter";
import { enrollGym, unenrollGym, enrolledGyms, Gym } from "@/lib/sqlite";

export default function SetGymScreen() {
  const router = useRouter();
  const [selectedGyms, setSelectedGyms] = React.useState<Gym[]>([]);

  useEffect(() => {
    enrolledGyms().then(setSelectedGyms);
  }, []);

  function enrolledInGym(name: string, builtin: boolean = true) {
    return (
      typeof selectedGyms.find(
        (gym) => gym.name === name && gym.builtin === builtin
      ) !== "undefined"
    );
  }

  const toggleGym = async (
    name: string,
    latitude: number,
    longitude: number,
    builtin: boolean = true
  ) => {
    if (enrolledInGym(name, builtin)) {
      await unenrollGym(name, builtin);
    } else {
      await enrollGym(name, latitude, longitude, builtin);
    }

    setSelectedGyms(await enrolledGyms());
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        style={styles.card}
        colors={["rgba(255, 255, 255, 0.03)", "rgba(255, 255, 255, 0)"]}
        locations={[0, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.title}>Save your Gym</Text>
            <Text style={styles.subtitle}>Where do you workout?</Text>
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            <ToggleCard
              name="Vasa"
              icon="navigation"
              isSelected={enrolledInGym("Vasa")}
              onToggle={() => toggleGym("Vasa", 0, 0)}
            />
            <ToggleCard
              name="EOS"
              icon="navigation"
              isSelected={enrolledInGym("EOS")}
              onToggle={() => toggleGym("EOS", 0, 0)}
            />
            <ToggleCard
              name="Planet Fitness"
              icon="navigation"
              isSelected={enrolledInGym("Planet Fitness")}
              onToggle={() => toggleGym("Planet Fitness", 0, 0)}
            />

            {/* Custom Selected Gyms */}
            {selectedGyms
              .filter((gym) => !gym.builtin)
              .map((gym) => (
                <ToggleCard
                  key={gym.name}
                  name={gym.name}
                  subtitle={gym.address || `${gym.latitude}, ${gym.longitude}`}
                  icon="navigation"
                  variant="delete"
                  onDelete={() => unenrollGym(gym.name, false)}
                  isSelected={true}
                  onToggle={() =>
                    toggleGym(gym.name, gym.latitude, gym.longitude, false)
                  }
                />
              ))}

            <ToggleCard
              name="Add Gym"
              icon="plus"
              variant="add"
              onToggle={async () => {
                try {
                  const { coords } = await getCurrentLocation();

                  pickPlace({
                    presentationStyle: "fullscreen",
                    title: "Add Your Gym",
                    searchPlaceholder: "Search for your gym...",
                    color: "#27272a",
                    contrastColor: "#ffffff",
                    enableUserLocation: true,
                    enableGeocoding: true,
                    enableSearch: true,
                    enableLargeTitle: true,
                    initialCoordinates: {
                      latitude: coords.latitude,
                      longitude: coords.longitude,
                    },
                    rejectOnCancel: false,
                  })
                    .then(async (result) => {
                      if (result && result.address) {
                        console.log(
                          "Full place result:",
                          JSON.stringify(result, null, 2)
                        );
                        console.log(
                          "Address object:",
                          JSON.stringify(result.address, null, 2)
                        );

                        const gymName =
                          result.address.name || result.address.streetName;
                        const gymAddress = result.address.streetName;

                        console.log("Using name:", gymName);
                        console.log("Using address:", gymAddress);

                        await enrollGym(
                          gymName,
                          result.coordinate.latitude,
                          result.coordinate.longitude,
                          false,
                          gymAddress
                        );
                        setSelectedGyms(await enrolledGyms());
                      }
                    })
                    .catch((error) => {
                      if (!error.toString().includes("cancel")) {
                        console.error(error);
                      }
                    });
                } catch (error) {
                  console.error("Error getting location:", error);
                }
              }}
            />
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Button
              onPress={() => router.push("/(tabs)/leaderboard")}
              buttonStyles={styles.button}
            >
              Continue
            </Button>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090b",
  },
  card: {
    flex: 1,
    borderTopWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    overflow: "hidden",
    marginTop: 15,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "flex-start",
    paddingTop: 95,
  },
  header: {
    alignItems: "center",
    marginBottom: 60,
  },
  title: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: "white",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    color: "#a1a1aa",
    textAlign: "center",
    lineHeight: 24,
  },
  mainContent: {
    flex: 1,
    alignItems: "center",
  },
  footer: {
    marginTop: "auto",
    width: "100%",
  },
  button: {
    width: "100%",
    backgroundColor: "#27272a",
  },
});
