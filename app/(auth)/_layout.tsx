import { useAuth } from "@/lib/supabase";
import { Redirect, Stack } from "expo-router";

export default function AuthLayout() {
  const auth = useAuth();

  if (auth.user) {
    if (!auth.realName) {
      console.log("User needs to set name first");
      return <Redirect href="/(setup)/setName" />;
    }

    if (typeof auth.gymGoal === "undefined") {
      console.log("User needs to set goal first");
      return <Redirect href="/(setup)/setGoal" />;
    }

    console.log("Setup complete, going to leaderboard");
    return <Redirect href="/(tabs)/leaderboard" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="Permission" />
    </Stack>
  );
}
