import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SkiaNumber } from "../../components/ui/Login/Number";
import {
  Canvas,
  RadialGradient,
  Circle,
  vec,
} from "@shopify/react-native-skia";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type LeaderboardEntry = {
  rank: number;
  name: string;
  discord: string;
  score: number;
};

// Fallback dummy data in case the API call fails
const dummyData: LeaderboardEntry[] = [
  { rank: 1, name: "Richard Grover", discord: "rirard", score: 4 },
  { rank: 2, name: "Khayden", discord: "Husssy", score: 3 },
  { rank: 3, name: "Quandale Dingle", discord: "Rizzzparty", score: 2 },
  { rank: 4, name: "Tyson Cloud", discord: "Booom", score: 1 },
  { rank: 5, name: "Quandale Dingle", discord: "Rizzzparty", score: 2 },
  { rank: 6, name: "Tyson Cloud", discord: "Booom", score: 1 },
  { rank: 7, name: "Quandale Dingle", discord: "Rizzzparty", score: 2 },
  { rank: 8, name: "Tyson Cloud", discord: "Booom", score: 1 },
];

export default function LeaderboardScreen() {
  const windowWidth = Dimensions.get("window").width;
  const topSectionHeight = Dimensions.get("window").height * 0.33;
  const [leaderboardData, setLeaderboardData] =
    useState<LeaderboardEntry[]>(dummyData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalParticipants, setTotalParticipants] = useState<number>(12);

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const fetchLeaderboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke("leaderboard", {
        // You can pass parameters if your function needs them
        body: {
          limit: 20,
          // Add any other parameters your function expects
        },
      });

      if (error) {
        console.error("Error calling leaderboard function:", error);
        setError("Failed to load leaderboard data");
        return;
      }

      // Process the data based on the actual format returned by the Edge Function
      if (data && Array.isArray(data)) {
        // Transform the data to match our LeaderboardEntry type
        const transformedData: LeaderboardEntry[] = data.map((item: any) => {
          const entry = {
            rank: item.placment, // Note the spelling 'placment' from the API
            name: item.fullname || "Unknown User", // Use fullname instead of name
            discord: item.discord,
            score: item.week_streak, // Using week_streak as the score
          };

          console.log("TRANSFORMED ENTRY:", JSON.stringify(entry, null, 2));
          return entry;
        });

        setLeaderboardData(transformedData);
        setTotalParticipants(data.length);
      } else {
        console.warn("Unexpected data format:", data);
        setError("Received invalid data format");
      }
    } catch (err) {
      console.error("Exception when fetching leaderboard:", err);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Canvas style={styles.gradientCanvas}>
          <Circle cx={windowWidth / 2} cy={topSectionHeight / 2} r={200}>
            <RadialGradient
              c={vec(windowWidth / 2, topSectionHeight / 2)}
              r={200}
              colors={["#733F71", "#09090b"]}
            />
          </Circle>
        </Canvas>
        <View style={styles.numberContainer}>
          <SkiaNumber text={totalParticipants.toString()} size={175} />
        </View>
      </View>

      <LinearGradient
        colors={["rgba(255, 255, 255, 0.2)", "transparent"]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.title}>Workouts</Text>
            <View style={styles.subtitle}>
              <Text style={styles.icon}>📍</Text>
              <Text style={styles.location}>The Sandwich</Text>
            </View>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading leaderboard...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <Text style={styles.retryText} onPress={fetchLeaderboardData}>
                Tap to retry
              </Text>
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

                  <View style={styles.userInfo}>
                    <Text style={styles.name}>{entry.name}</Text>
                    <View style={styles.discordContainer}>
                      <Text style={styles.discordIcon}>🎮</Text>
                      <Text style={styles.discord}>{entry.discord}</Text>
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
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090b",
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
    height: "67%", // Takes up bottom 2/3
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 1,
  },
  card: {
    flex: 1,
    borderRadius: 13,
    backgroundColor: "rgba(9, 9, 11, 0.7)", // Semi-transparent dark background
    padding: 24,
  },
  cardHeader: {
    marginBottom: 36,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#fafafa",
    marginBottom: 13,
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
    flex: 1,
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
  userInfo: {
    flex: 1,
    marginLeft: 12,
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
  },
  errorText: {
    color: "#ef4444",
    fontSize: 16,
    marginBottom: 12,
  },
  retryText: {
    color: "#a1a1aa",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});
