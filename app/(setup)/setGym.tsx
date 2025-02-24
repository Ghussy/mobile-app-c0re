import { useEffect, useState } from "react";
import { SafeAreaView, View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Button from "@/components/ui/Button";
import ToggleCard from "@/components/ui/toggle-card";
import { enrollGym, unenrollGym, enrolledGyms, Gym } from "@/lib/sqlite";

export default function SetGymScreen() {
  const router = useRouter();
  const [selectedGyms, setSelectedGyms] = useState<Gym[]>([]);

  useEffect(() => {
    enrolledGyms().then(setSelectedGyms);
  }, []);

  function enrolledInBuiltinGym(name: string) {
    return (
      typeof selectedGyms.find(
        (gym) => gym.name === name && gym.builtin === true,
      ) !== "undefined"
    );
  }

  const toggleGym = async (
    name: string,
    latitude: number,
    longitude: number,
  ) => {
    if (enrolledInBuiltinGym(name)) {
      await unenrollGym(name, true);
    } else {
      await enrollGym(name, latitude, longitude, true);
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
              isSelected={enrolledInBuiltinGym("vasa")}
              onToggle={() => toggleGym("vasa", 0, 0)}
            />
            <ToggleCard
              name="EOS"
              icon="navigation"
              isSelected={enrolledInBuiltinGym("eos")}
              onToggle={() => toggleGym("eos", 0, 0)}
            />
            <ToggleCard
              name="Planet Fitness"
              icon="navigation"
              isSelected={enrolledInBuiltinGym("planet")}
              onToggle={() => toggleGym("planet", 0, 0)}
            />
            <ToggleCard
              name="Add Gym"
              icon="plus"
              variant="add"
              onToggle={() => {
                /* Handle add gym */
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
