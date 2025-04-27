import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Linking,
  Animated,
  Switch,
  Button,
  RefreshControl,
} from "react-native";
import { getRecentLocations } from "@/lib/sqlite";
import { MapPin, Settings } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BackgroundGeolocation from "react-native-background-geolocation";
import { useFocusEffect } from "@react-navigation/native";
import { setDebugMode } from "@/providers/LocationReporter";

export default function LocationHistory() {
  const [locations, setLocations] = useState<
    Array<{
      latitude: number;
      longitude: number;
      speed: number;
      timestamp: string;
    }>
  >([]);
  const [bgState, setBgState] = useState<any>(null);
  const [debugEnabled, setDebugEnabled] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    const [state, recentLocations] = await Promise.all([
      BackgroundGeolocation.getState(),
      getRecentLocations(),
    ]);
    setBgState(state);
    setDebugEnabled(state.debug || false);
    setLocations(recentLocations);
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
      const interval = setInterval(loadData, 5000);
      return () => clearInterval(interval);
    }, [])
  );

  const toggleDebug = async (value: boolean) => {
    setDebugEnabled(value);
    await setDebugMode(value);
    await loadData();
  };

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

    const sortedLocations = [...locations].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    sortedLocations.forEach((location) => {
      const date = new Date(location.timestamp);
      const today = new Date();
      const formatter = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      });

      const isToday = formatter.format(date) === formatter.format(today);
      const key = isToday ? "Today" : formatter.format(date);

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
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.settingsPanel}>
          <View style={styles.settingsHeader}>
            <Settings size={20} color="#fafafa" />
            <Text style={styles.settingsTitle}>Plugin Settings</Text>
          </View>

          <View style={styles.debugContainer}>
            <Text style={styles.settingItem}>Debug Mode</Text>
            <Switch
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={debugEnabled ? "#3b82f6" : "#f4f3f4"}
              onValueChange={toggleDebug}
              value={debugEnabled}
            />
          </View>

          {bgState && (
            <ScrollView style={styles.stateScrollView}>
              <Text style={styles.stateText}>
                {JSON.stringify(bgState, null, 2)}
              </Text>
            </ScrollView>
          )}
        </View>

        {locationGroups.map(([date, { locations: dateLocations }]) => (
          <View key={date} style={styles.dateGroup}>
            <View style={styles.dateHeaderContainer}>
              <Text style={styles.dateHeader}>{date}</Text>
              {date === "Today"}
            </View>
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
                    {new Date(location.timestamp).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "numeric",
                      hour12: true,
                    })}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090b",
  },
  scrollView: {
    flex: 1,
  },
  settingsPanel: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 15,
    margin: 10,
    borderRadius: 8,
  },
  settingsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  settingsTitle: {
    color: "#fafafa",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 10,
    fontFamily: "Inter_600SemiBold",
  },
  settingItem: {
    color: "#a1a1aa",
    fontSize: 14,
    marginBottom: 5,
    fontFamily: "Inter_400Regular",
  },
  dateGroup: {
    marginBottom: 20,
    marginHorizontal: 10,
  },
  dateHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fafafa",
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
  locationIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#ef4444",
    marginLeft: 10,
  },
  debugContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
    marginBottom: 15,
  },
  stateScrollView: {
    maxHeight: 150,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 5,
    padding: 8,
  },
  stateText: {
    fontFamily: "monospace",
    fontSize: 12,
    color: "#a1a1aa",
  },
});
