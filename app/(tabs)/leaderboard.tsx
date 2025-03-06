import React, { useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
  Pressable,
  SafeAreaView,
} from "react-native";
import { SkiaNumber } from "../../components/ui/Login/Number";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Settings, X } from "lucide-react-native";
import { DotProgressBar } from "@/components/ui/DotProgressBar";
import { GradientCard } from "@/components/ui/GradientCard";
import { useGymGoal } from "@/lib/hooks/useGymGoal";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { SettingsBottomSheet } from "@/components/ui/SettingsBottomSheet";

type LeaderboardEntry = {
  rank: number;
  name: string;
  discord: string;
  score: number;
  icon?: string;
};

export default function LeaderboardScreen() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalParticipants, setTotalParticipants] = useState<number>(0);
  const [currentProgress, setCurrentProgress] = useState(2);
  const [currentStreak, setCurrentStreak] = useState(20);
  const { gymGoal } = useGymGoal();

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const handleSettingsPress = () => {
    bottomSheetRef.current?.expand();
  };

  const fetchLeaderboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke("leaderboard", {
        body: {
          limit: 20,
        },
      });

      if (error) {
        setError("Failed to load leaderboard data");
        return;
      }

      const transformedData: LeaderboardEntry[] = data.map((item: any) => ({
        rank: item.placment || 0,
        name: item.fullname || "Unknown User",
        discord: item.discord || "unknown",
        score: item.week_streak || 0,
        icon: item.icon,
      }));

      setLeaderboardData(transformedData);
      setTotalParticipants(data.length);
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.exerciseTitle}>Exercise</Text>
        </View>

        <DotProgressBar total={gymGoal || 0} completed={currentProgress} />

        <View style={styles.statsContainer}>
          <GradientCard style={styles.statCardContainer}>
            <View style={styles.statContent}>
              <Text style={styles.statTitle}>Weekly Goal</Text>
              <View style={styles.statValueContainer}>
                <View style={styles.numberWrapper}>
                  <SkiaNumber text={currentProgress.toString()} size={60} />
                </View>
                <Text style={styles.statDivider}>/</Text>
                <Text style={styles.statTotal}>{gymGoal || 0}</Text>
              </View>
              <Text style={styles.statLabel}>Days</Text>
            </View>
          </GradientCard>

          <GradientCard style={styles.statCardContainer}>
            <View style={styles.statContent}>
              <Text style={styles.statTitle}>Current Streak</Text>
              <View style={styles.statValueContainer}>
                <SkiaNumber text={currentStreak.toString()} size={60} />
              </View>
              <Text style={styles.statLabel}>Weeks</Text>
            </View>
          </GradientCard>
        </View>

        <GradientCard>
          <View style={styles.cardHeader}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>Leaderboard</Text>
              <Pressable
                onPress={handleSettingsPress}
                style={styles.settingsButton}
              >
                <Settings size={20} color="#a1a1aa" />
              </Pressable>
            </View>
            <View style={styles.subtitle}>
              <Text style={styles.icon}>📍</Text>
              <Text style={styles.location}>Neumont Gym Club</Text>
            </View>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading leaderboard...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <Pressable
                onPress={fetchLeaderboardData}
                style={styles.retryButton}
              >
                <Text style={styles.retryText}>Tap to retry</Text>
              </Pressable>
            </View>
          ) : leaderboardData.length === 0 ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                No leaderboard data available
              </Text>
              <Pressable
                onPress={fetchLeaderboardData}
                style={styles.retryButton}
              >
                <Text style={styles.retryText}>Tap to reload</Text>
              </Pressable>
            </View>
          ) : (
            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
            >
              {leaderboardData.map((entry) => (
                <View key={entry.rank} style={styles.row}>
                  <View style={styles.rankContainer}>
                    <Text
                      style={[
                        styles.rank,
                        entry.rank <= 3 ? styles.topRank : styles.normalRank,
                      ]}
                    >
                      {entry.rank}
                    </Text>
                  </View>

                  <View style={styles.userSection}>
                    <View style={styles.avatarContainer}>
                      {entry.icon ? (
                        <Image
                          source={{ uri: entry.icon }}
                          style={styles.avatar}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.avatarPlaceholder} />
                      )}
                    </View>

                    <View style={styles.userInfo}>
                      <Text style={styles.name}>{entry.name}</Text>
                      <View style={styles.discordContainer}>
                        <Text style={styles.discordIcon}>🎮</Text>
                        <Text style={styles.discord}>{entry.discord}</Text>
                      </View>
                    </View>
                  </View>

                  <Text
                    style={[
                      styles.score,
                      entry.rank === 1 ? styles.topScore : styles.normalScore,
                    ]}
                  >
                    {entry.score}
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}
        </GradientCard>
      </View>

      <SettingsBottomSheet bottomSheetRef={bottomSheetRef} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090b",
  },
  mainContainer: {
    flex: 1,
    gap: 24,
    paddingHorizontal: 12,
    paddingTop: 20,
    paddingBottom: 20,
  },
  titleContainer: {
    alignItems: "center",
  },
  exerciseTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 16,
  },
  statCardContainer: {
    flex: 1,
  },
  statContent: {
    alignItems: "center",
  },
  statTitle: {
    fontSize: 16,
    color: "#a1a1aa",
    marginBottom: 15,
    fontFamily: "Inter_600SemiBold",
  },
  statValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 70,
    width: "100%",
  },
  numberWrapper: {
    justifyContent: "center",
    alignItems: "center",
    height: 70,
    marginRight: 8,
  },
  statDivider: {
    fontSize: 32,
    color: "#a1a1aa",
    alignSelf: "center",
    marginRight: 4,
  },
  statTotal: {
    fontSize: 32,
    color: "#a1a1aa",
    alignSelf: "center",
    fontFamily: "Orbitron-SemiBold",
  },
  statLabel: {
    fontSize: 16,
    color: "#a1a1aa",
    marginTop: 10,
    fontFamily: "Inter_600SemiBold",
  },
  topSection: {
    height: "33%", // Takes up top 1/3
    justifyContent: "center",
    alignItems: "center",
  },
  gradientCanvas: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  numberContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  gradient: {
    flex: 1,
  },
  cardHeader: {
    marginBottom: 36,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 13,
  },
  settingsButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fafafa",
    fontFamily: "Inter_600SemiBold",
  },
  subtitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  icon: {
    fontSize: 16,
  },
  location: {
    fontSize: 12,
    color: "#a1a1aa",
  },
  scrollView: {
    flexGrow: 0,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  rankContainer: {
    width: 32,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  rank: {
    fontSize: 20,
    fontStyle: "italic",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 2.4,
    textShadowColor: "#000",
  },
  topRank: {
    color: "#ffffff",
    fontWeight: "700",
  },
  normalRank: {
    color: "#a1a1aa",
    fontWeight: "500",
  },
  userSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
  },
  userInfo: {
    flex: 1,
    marginLeft: 8,
  },
  name: {
    fontSize: 16,
    color: "#fafafa",
    fontWeight: "500",
    marginBottom: 4,
  },
  discordContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  discordIcon: {
    fontSize: 12,
  },
  discord: {
    fontSize: 12,
    color: "#a1a1aa",
  },
  score: {
    fontSize: 20,
    fontFamily: "Orbitron-Medium",
  },
  topScore: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "700",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  normalScore: {
    color: "#a1a1aa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#a1a1aa",
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 32,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 16,
    marginBottom: 12,
    textAlign: "center",
  },
  retryButton: {
    padding: 12,
  },
  retryText: {
    color: "#a1a1aa",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  avatarContainer: {
    marginRight: 8,
  },
  avatar: {
    width: 39,
    height: 39,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  avatarPlaceholder: {
    width: 39,
    height: 39,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  avatarText: {
    fontSize: 16,
  },
});
