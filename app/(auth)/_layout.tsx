import { Redirect, Stack } from "expo-router";
import { profile$, streaks$ } from "@/lib/legendState";
import { session$ } from "@/lib/legendState/session";
import { use$ } from "@legendapp/state/react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
export default function AuthLayout() {
  const user = use$(session$.user);
  const name = use$(profile$.name);
  // const streak = use$(streaks$);
  // const allActivityStreaks = use$(streaks$); // Assuming activity_streaks$ is your collection

  // console.log("allActivityStreaks", allActivityStreaks);
  // console.log("🐸 streak object: ", streak);
  // console.log("name", name);

  if (user === undefined || (user && (name === undefined))) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  if (user) {
    if (!name) {
      return <Redirect href="/(setup)/setName" />;
    }
    // if (!streakGoal) {
    //   return <Redirect href="/(setup)/setGoal" />;
    // }
    console.log("AuthLayout: Setup complete. Redirecting to leaderboard.");
    return <Redirect href="/(tabs)/dashboard" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="Permission" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
