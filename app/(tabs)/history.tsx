import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { getRecentLocations } from "@/lib/sqlite";

export default function LocationHistory() {
  const [locations, setLocations] = useState<
    Array<{
      latitude: number;
      longitude: number;
      speed: number;
      timestamp: string;
    }>
  >([]);

  useEffect(() => {
    const loadLocations = async () => {
      const recentLocations = await getRecentLocations();
      setLocations(recentLocations);
    };

    loadLocations();
    const interval = setInterval(loadLocations, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ScrollView style={styles.container}>
      {locations.map((location, index) => (
        <View key={index} style={styles.locationItem}>
          <Text style={styles.locationText}>
            Latitude: {location.latitude.toFixed(6)}
          </Text>
          <Text style={styles.locationText}>
            Longitude: {location.longitude.toFixed(6)}
          </Text>
          <Text style={styles.locationText}>
            Speed: {location.speed?.toFixed(2) || "N/A"} m/s
          </Text>
          <Text style={styles.timestampText}>
            {new Date(location.timestamp).toLocaleString()}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
  },
  locationItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  locationText: {
    fontSize: 16,
    marginBottom: 5,
  },
  timestampText: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
});
