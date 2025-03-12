import { Stack, Redirect } from "expo-router";
import { useAuth } from "@/lib/supabase";
import { enrolledGyms } from "@/lib/sqlite";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TabsLayout() {
  const auth = useAuth();
  const [shouldRedirect, setRedirect] = useState(false);

  useEffect(() => {
    if (auth.realName && auth.gymGoal !== undefined) {
      enrolledGyms().then((gyms) => {
        if (gyms.length === 0) {
          setRedirect(true);
        }
      });
    }
  }, [auth.realName, auth.gymGoal]);

  // Wait for auth to be initialized
  if (!auth.isInitialized) {
    return null;
  }

  // Handle all redirects
  if (!auth.user) {
    return <Redirect href="/(auth)" />;
  }

  if (!auth.realName) {
    return <Redirect href="/(setup)/setName" />;
  }

  if (typeof auth.gymGoal === "undefined") {
    return <Redirect href="/(setup)/setGoal" />;
  }

  if (shouldRedirect) {
    return <Redirect href="/(setup)/setGym" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="leaderboard" />
    </Stack>
  );
}
