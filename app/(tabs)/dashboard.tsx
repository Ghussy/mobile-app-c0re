import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  FlatList, // Add FlatList import back
} from "react-native";
import { Settings } from "lucide-react-native";
import { SettingsBottomSheet } from "@/components/ui/SettingsBottomSheet";
import {
  openGlobalSettingsMenu,
  openStreakMenu,
} from "@/lib/legendState/bottomSheet";
import { profile$ } from "@/lib/legendState";
import {
  sortedComputedStreaksArray$, // Directly import the final observable array
} from "@/lib/legendState/streak";
import { logActivity } from "@/lib/legendState/activity_logs";
import { use$, observer } from "@legendapp/state/react"; // Make sure use$ and observer are imported
import { StreakCard } from "@/components/ui/streak-card";
import BottomSheet from "@gorhom/bottom-sheet";
import { GradientCard } from "@/components/ui/GradientCard";
import { router } from "expo-router";

// This wraps StreakCard to make it reactive to its props.
// If StreakCard is already wrapped with observer() in its own file, remove this line.
const ObserverStreakCard = observer(StreakCard);

export default observer(function DashboardScreen() {
  const bottomSheetRef = useRef<BottomSheet>(null);

  const userProfile$ = use$(profile$); // Use use$ to consume profile$
  const sortedStreaks = use$(sortedComputedStreaksArray$); // Use use$ to consume sortedStreaksArray$

  const handleSettingsPress = () => openGlobalSettingsMenu(bottomSheetRef);

  // Loading condition: Check if userProfile$ or sortedStreaks are undefined.
  if (userProfile$ === undefined || sortedStreaks === undefined) {
    return (
      <SafeAreaView style={styles.container}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={{ color: "white", marginTop: 10 }}>
            Loading Dashboard...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Text style={styles.profileName}>
              {userProfile$.name || "User"}
            </Text>
            <Pressable
              onPress={handleSettingsPress}
              style={styles.settingsIconContainer}
            >
              <Settings size={22} color="#A1A1AA" />
            </Pressable>
          </View>
          <View style={styles.discordInfo}>
            <Image
              source={{
                uri:
                  userProfile$.avatar_url || "https://placekitten.com/100/100",
              }}
              style={styles.discordAvatar}
            />
            <Text style={styles.discordUsername}>
              {userProfile$.discord_name}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Your Streaks</Text>

        {sortedStreaks.length === 0 ? ( // `sortedStreaks` is the raw array (if loaded)
          <GradientCard>
            <Text style={styles.emptyText}>No activity streaks yet.</Text>
            <Text style={styles.emptySub}>
              Set a goal for an activity to get started!
            </Text>
          </GradientCard>
        ) : (
          <FlatList
            data={sortedStreaks} // `sortedStreaks` is the array of ObservableObjects
            keyExtractor={(item) => item.id} // `item.id` is Observable<string>, so use .peek()
            renderItem={({ item: computedStreakItemObservable }) => {
              // `item` is ObservableObject<ComputedStreak>
              // Extract primitive values for StreakCard's props
              const rawStreakData = computedStreakItemObservable; // Get raw object for 'streak' prop
              const activityName = computedStreakItemObservable.activityName;
              const daysCompletedThisWeek =
                computedStreakItemObservable.daysCompletedThisWeek;

              return (
                <ObserverStreakCard
                  streak={rawStreakData} // Pass the raw object
                  activityName={activityName} // Pass the primitive string
                  currentProgressInWeek={daysCompletedThisWeek} // Pass the primitive string
                  onOpenMenu={() =>
                    openStreakMenu(rawStreakData, bottomSheetRef)
                  } // Pass the raw object to menu
                />
              );
            }}
            scrollEnabled={false}
          />
        )}
      </ScrollView>
      <View style={styles.logWorkoutButtonContainer}>
        <Pressable
          style={styles.logWorkoutButton}
          onPress={() => logActivity("e5f8fd55-12b4-4988-8942-8e1f711d6ca4")}
        >
          <Text style={styles.logWorkoutButtonText}>Log Activity</Text>
        </Pressable>
        <Pressable
          style={styles.logWorkoutButton}
          onPress={() => router.push("/(tabs)/createActivity")}
        >
          <Text style={styles.logWorkoutButtonText}>Create Activity</Text>
        </Pressable>
      </View>
      <SettingsBottomSheet bottomSheetRef={bottomSheetRef} />
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000" },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 100 },
  profileCard: {
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 14,
    backgroundColor: "transparent",
  },
  profileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    fontFamily: "Inter_700Bold",
  },
  settingsIconContainer: { padding: 4 },
  discordInfo: { flexDirection: "row", alignItems: "center" },
  discordAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 8,
    backgroundColor: "#7289DA",
  },
  discordUsername: {
    fontSize: 14,
    color: "#B9BBBE",
    fontFamily: "Inter_400Regular",
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    fontFamily: "Inter_700Bold",
    marginBottom: 16,
    marginTop: 16,
  },
  logWorkoutButtonContainer: {
    gap: 16,
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#000000",
  },
  logWorkoutButton: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    backgroundColor: "#27272A",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  logWorkoutButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter_700Bold",
  },
  emptyText: {
    fontSize: 18,
    color: "#ffffff",
    fontWeight: "500",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySub: { fontSize: 14, color: "#a1a1aa", textAlign: "center" },
});
