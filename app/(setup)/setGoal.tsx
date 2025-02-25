import { useState } from "react";
import { SafeAreaView, View, Text, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import Button from "@/components/ui/Button";
import { AnimatedCount } from "@/components/ui/wheel-picker/animated-count/animated-count";
import { DraggableSlider } from "@/components/ui/wheel-picker/draggable-slider";
import { useAuth } from "@/lib/supabase";

const LINES_AMOUNT = 7;
const API_UDPATE_DEBOUNCE = 500;

export default function SetGoalScreen() {
  const router = useRouter();
  const { isEditing } = useLocalSearchParams<{ isEditing?: string }>();
  const [_, setFetchTimeout] = useState<NodeJS.Timeout | undefined>(undefined);
  const auth = useAuth();

  const daySelection = useSharedValue(0);

  function updateDaySelection(days: number) {
    setFetchTimeout((timeout) => {
      clearTimeout(timeout);
      return setTimeout(() => {
        auth.goalInfo?.set(days);
      }, API_UDPATE_DEBOUNCE);
    });
  }

  useAnimatedReaction(
    () => daySelection.value,
    (days, prev) => {
      if (days === prev) return;
      runOnJS(updateDaySelection)(days);
    }
  );

  const indicatorColor = useSharedValue("#22c55e");

  const handleContinue = () => {
    if (isEditing) {
      // If editing from settings, show a reminder or do your logic
      // For now, we simply go back. Adjust as needed.
      router.back();
    } else {
      // If in initial setup flow, continue to next step
      router.push("/(setup)/setGym");
    }
  };

  // Dynamic text based on editing
  const titleText = isEditing ? "Update Your Goal" : "Set a Goal!";
  const subtitleText = isEditing
    ? "Keep in mind that editing your goal will reset your streak.\nHow many days per week do you want to work out?"
    : "How many days per week do you want to work out?";

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
            <AnimatedCount
              count={daySelection}
              maxDigits={10}
              textDigitWidth={80}
              textDigitHeight={130}
              fontSize={100}
              color="white"
            />
            <Text style={styles.daysLabel}>Days</Text>

            <View style={styles.sliderContainer}>
              <DraggableSlider
                scrollableAreaHeight={150}
                spacePerLine={50}
                showBoundaryGradient
                bigLineIndexOffset={20}
                snapEach={1}
                linesAmount={LINES_AMOUNT}
                maxLineHeight={20}
                minLineHeight={10}
                indicatorColor={indicatorColor}
                onProgressChange={(sliderProgress) => {
                  "worklet";
                  if (sliderProgress < 0) return;
                  daySelection.value = Math.ceil(sliderProgress * LINES_AMOUNT);
                }}
              />
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Button onPress={handleContinue} buttonStyles={styles.button}>
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
    justifyContent: "space-between",
    paddingTop: 65,
  },
  header: {
    alignItems: "center",
    paddingTop: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
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
    justifyContent: "center",
    alignItems: "center",
  },
  daysLabel: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    color: "white",
    marginTop: 10,
    marginBottom: 20,
  },
  sliderContainer: {
    marginTop: 10,
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
