import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Linking,
} from "react-native";
import { getRecentLocations } from "@/lib/sqlite";
import { MapPin } from "lucide-react-native";

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

  const openInMaps = (latitude: number, longitude: number) => {
    const url = `maps://maps.apple.com/?q=${latitude},${longitude}`;
    Linking.openURL(url).catch((err) => {
      console.error("Error opening maps:", err);
    });
  };

  const groupLocationsByDate = () => {
    const groups: {
      [key: string]: { date: Date; locations: typeof locations };
    } = {};

    // Sort locations by timestamp first
    const sortedLocations = [...locations].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    sortedLocations.forEach((location) => {
      const date = new Date(location.timestamp);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const locationDate = new Date(date);
      locationDate.setHours(0, 0, 0, 0);

      const isToday = locationDate.getTime() === today.getTime();
      const key = isToday ? "Today" : date.toLocaleDateString();

      if (!groups[key]) {
        groups[key] = {
          date: date,
          locations: [],
        };
      }
      groups[key].locations.push(location);
    });

    return Object.entries(groups).sort((a, b) => {
      if (a[0] === "Today") return -1;
      if (b[0] === "Today") return 1;
      return b[1].date.getTime() - a[1].date.getTime();
    });
  };

  const locationGroups = groupLocationsByDate();

  return (
    <ScrollView style={styles.container}>
      {locationGroups.map(([date, { locations: dateLocations }]) => (
        <View key={date} style={styles.dateGroup}>
          <Text style={styles.dateHeader}>{date}</Text>
          {dateLocations.map((location, index) => (
            <View key={index} style={styles.locationItem}>
              <View style={styles.locationContent}>
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
                  {new Date(location.timestamp).toLocaleTimeString()}
                </Text>
              </View>
              <Pressable
                style={styles.mapButton}
                onPress={() =>
                  openInMaps(location.latitude, location.longitude)
                }
              >
                <MapPin size={20} color="#fafafa" />
              </Pressable>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090b",
    padding: 10,
  },
  dateGroup: {
    marginBottom: 20,
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fafafa",
    marginBottom: 10,
    fontFamily: "Inter_600SemiBold",
  },
  locationItem: {
    padding: 15,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  locationContent: {
    flex: 1,
  },
  locationText: {
    fontSize: 16,
    color: "#fafafa",
    marginBottom: 5,
    fontFamily: "Inter_400Regular",
  },
  timestampText: {
    fontSize: 14,
    color: "#a1a1aa",
    marginTop: 5,
    fontFamily: "Inter_400Regular",
  },
  mapButton: {
    padding: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    marginLeft: 10,
  },
});
