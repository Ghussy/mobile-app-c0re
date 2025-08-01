import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { GradientCard } from "@/components/ui/GradientCard";
import { SkiaNumber } from "@/components/ui/Login/Number";
import { LinearGradient } from "expo-linear-gradient";
import BoltIcon from "@/components/ui/icons/BoltIcon";

import { Tables } from "@/types/database.types";

const PROGRESS_BAR_HEIGHT = 5;

type StreakCardProps = {
  streak: Tables<"activity_streaks">;
  activityName: string;
  currentProgressInWeek: number;
  onOpenMenu: () => void;
};

export const StreakCard: React.FC<StreakCardProps> = ({
  streak,
  activityName,
  currentProgressInWeek,
  onOpenMenu,
}) => {
  const calculateProgressPercentage = (
    current: number,
    goal: number
  ): number => {
    if (goal <= 0) return 0;
    const percentage = (current / goal) * 100;
    return Math.min(Math.max(percentage, 0), 100);
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (e) {
      return String(dateString);
    }
  };

  return (
    <GradientCard onPress={onOpenMenu} style={{ marginBottom: 16 }}>
      <View style={styles.exerciseHeader}>
        <Text style={styles.exerciseTitle}>{activityName}</Text>
        <View style={styles.exerciseStreak}>
          <SkiaNumber
            text={streak.current_streak?.toString() || "0"}
            size={28}
          />
          <BoltIcon
            width={12}
            height={22}
            color="#FFEA72"
            style={{ marginLeft: 6 }}
          />
        </View>
      </View>
      <View style={styles.exerciseProgressContainer}>
        <View style={styles.progressBarBackground}>
          <LinearGradient
            colors={["#4996F7", "#34D9FA", "#C2D5FF", "#B0CAFF"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={[
              styles.progressBarFill,
              {
                width: `${calculateProgressPercentage(
                  currentProgressInWeek,
                  streak.streak_goal || 0
                )}%`,
              },
            ]}
          />
        </View>
        <View style={styles.progressTextContainer}>
          <SkiaNumber text={currentProgressInWeek.toString()} size={24} />
          <Text style={styles.progressDivider}>/</Text>
          <Text style={styles.progressGoal}>{streak.streak_goal || 0}</Text>
        </View>
      </View>
      <Text style={styles.lastCompletedText}>
        Longest: {streak.longest_streak || 0} weeks | Last goal met:{" "}
        {formatDate(streak.last_completed_week)}
      </Text>
    </GradientCard>
  );
};

const styles = StyleSheet.create({
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  exerciseTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: "Inter_600SemiBold",
  },
  exerciseStreak: { flexDirection: "row", alignItems: "center" },
  exerciseProgressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  progressBarBackground: {
    flex: 1,
    height: PROGRESS_BAR_HEIGHT,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: PROGRESS_BAR_HEIGHT / 2,
    overflow: "hidden",
    marginRight: 12,
  },
  progressBarFill: { height: "100%", borderRadius: PROGRESS_BAR_HEIGHT / 2 },
  progressTextContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 3,
  },
  progressDivider: {
    color: "#A1A1AA",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    marginHorizontal: 2,
    lineHeight: 26,
  },
  progressGoal: {
    color: "#A1A1AA",
    fontSize: 20,
    fontFamily: "Orbitron-SemiBold",
    lineHeight: 26,
  },
  lastCompletedText: {
    fontSize: 12,
    color: "#71717a",
    textAlign: "center",
    fontFamily: "Inter_400Regular",
    marginTop: 8,
  },
});
