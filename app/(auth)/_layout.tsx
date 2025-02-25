import { useAuth } from "@/lib/supabase";
import { Redirect, Stack } from "expo-router";

export default function AuthLayout() {
  const auth = useAuth();
  if (auth.user) {
    console.log("Already signed in, going to leaderboard");
    return <Redirect href="/(tabs)/leaderboard" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="permissions" />
    </Stack>
  );
}
