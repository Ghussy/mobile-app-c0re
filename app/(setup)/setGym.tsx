import React from "react";
import { SafeAreaView, View, Text, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Button from "@/components/ui/Button";
import ToggleCard from "@/components/ui/toggle-card";
import { pickPlace } from "react-native-place-picker";
import { getCurrentLocation } from "@/providers/LocationReporter";
import { locations$, saveLocation } from "@/lib/legendState/locations";
import { use$ } from "@legendapp/state/react";

export default function SetGymScreen() {
  const router = useRouter();
  const { isEditing } = useLocalSearchParams<{ isEditing?: string }>();
  const locations = use$(locations$);
  const locationList = Object.values(locations || {});

  console.log("locations", locations);

  const handleContinue = () => {
    if (isEditing) {
      router.replace("/(tabs)/dashboard");
    } else {
      router.push("/(tabs)/dashboard");
    }
  };

  const titleText = isEditing ? "Update Your Gym" : "Save your Gym";
  const subtitleText = isEditing
    ? "Where do you workout?"
    : "Where do you workout?";

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
            <Text style={styles.title}>{titleText}</Text>
            <Text style={styles.subtitle}>{subtitleText}</Text>
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Custom Selected Gyms */}
            {locationList
              .filter(
                (location) => location && location.id && !location.deleted
              )
              .map((location) => (
                <ToggleCard
                  key={location.id}
                  name={location.name}
                  subtitle={
                    location.address ||
                    `${location.latitude}, ${location.longitude}`
                  }
                  icon="navigation"
                  variant="delete"
                  onDelete={async () => {
                    locations$[location.id].delete();
                  }}
                  isSelected={true}
                  onToggle={() => locations$[location.id].delete()}
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

                        if (!gymName) {
                          console.warn(
                            "No gym name found from place picker result. Not saving."
                          );
                        } else {
                          saveLocation({
                            name: gymName,
                            latitude: result.coordinate.latitude,
                            longitude: result.coordinate.longitude,
                            address: gymAddress,
                            radius_m: 100,
                            default_activity_id: null, // Will be set later when user selects a default activity
                          });
                        }
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
              onPress={handleContinue}
              buttonStyles={styles.button}
              disabled={locationList.filter((l) => !l.deleted).length === 0}
            >
              {isEditing ? "Save Changes" : "Continue"}
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
