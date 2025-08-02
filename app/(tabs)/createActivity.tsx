import React, { useState } from "react";
import {
  View,
  Image,
  StyleSheet,
  Text,
  TextInput,
  KeyboardAvoidingView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import Button from "@/components/ui/Button";
import { useRouter, Redirect } from "expo-router";
import { observer, use$ } from "@legendapp/state/react";
import { session$ } from "@/lib/legendState/session";
import { Ionicons } from "@expo/vector-icons";

// Mock locations for now
const mockLocations = [
  { id: "1", name: "Planet Fitness" },
  { id: "2", name: "Planet Fitness" },
  { id: "3", name: "Planet Fitness" },
];

export default observer(function CreateActivityScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [activityName, setActivityName] = useState("");
  const [locations, setLocations] = useState(mockLocations);
  const router = useRouter();
  const user = use$(session$.user); // reactive

  if (!user) {
    console.log("No user found, redirecting to auth");
    return <Redirect href="/(auth)" />;
  }

  const handleDeleteLocation = (id: string) => {
    setLocations((prev) => prev.filter((loc) => loc.id !== id));
  };

  const handleContinue = async () => {
    // TODO: handle activity creation
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <View style={styles.wrapper}>
        <View style={[styles.section, { zIndex: 2 }]}>
          <Text style={styles.title}>Create an activity</Text>

          {/* Activity Name Input */}
          <TextInput
            style={styles.input}
            onChangeText={setActivityName}
            value={activityName}
            placeholder="Lifting"
            placeholderTextColor="#A1A1AA"
          />

          {/* Locations List */}
          <Text style={styles.locationsLabel}>
            <Ionicons name="navigate" size={18} color="#fff" /> Locations
          </Text>
          <FlatList
            data={locations}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.locationCard}>
                <Text style={styles.locationName}>{item.name}</Text>
                <TouchableOpacity onPress={() => handleDeleteLocation(item.id)}>
                  <Ionicons name="trash" size={24} color="#FF2D55" />
                </TouchableOpacity>
              </View>
            )}
            style={{ width: "100%" }}
            contentContainerStyle={{ gap: 12 }}
          />

          {/* Continue Button */}
          <View style={styles.continueButton}>
            <Button
              disabled={!activityName || locations.length === 0 || isLoading}
              onPress={handleContinue}
              loading={isLoading}
            >
              Continue
            </Button>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090b",
  },
  wrapper: {
    flex: 1,
  },
  section: {
    width: "100%",
    backgroundColor: "#101012",
    alignItems: "center",
    borderTopColor: "#212123",
    borderTopWidth: 3,
    height: 750,
    paddingVertical: 30,
    paddingHorizontal: 20,
    bottom: 0,
    marginTop: 60,
  },
  backgroundFlare: {
    position: "absolute",
    zIndex: -1,
    width: "150%",
    height: 340,
    bottom: 0,
  },
  title: {
    color: "white",
    fontSize: 25,
    textAlign: "center",
    marginVertical: 20,
  },
  input: {
    backgroundColor: "black",
    color: "#A1A1AA",
    borderRadius: 7,
    borderColor: "#212123",
    borderWidth: 1,
    width: "100%",
    marginTop: 10,
    height: 55,
    paddingLeft: 15,
    marginBottom: 30,
    fontSize: 18,
  },
  typeLabel: {
    color: "#fff",
    fontSize: 20,
    marginBottom: 10,
    marginTop: 10,
    alignSelf: "center",
  },
  typeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 30,
    gap: 12,
  },
  typeCard: {
    flex: 1,
    backgroundColor: "#18181b",
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 18,
    borderWidth: 2,
    borderColor: "#232323",
    marginHorizontal: 4,
  },
  typeText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  locationsLabel: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 10,
    marginTop: 10,
    alignSelf: "flex-start",
    fontWeight: "500",
  },
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#18181b",
    borderRadius: 10,
    padding: 18,
    marginBottom: 0,
    width: "100%",
  },
  locationName: {
    color: "#fff",
    fontSize: 16,
  },
  continueButton: {
    marginTop: 30,
    width: "100%",
    height: 55,
    borderRadius: 8,
  },
});
