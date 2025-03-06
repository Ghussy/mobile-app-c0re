import { Stack, Redirect } from "expo-router";
import { useAuth } from "@/lib/supabase";
import { enrolledGyms } from "@/lib/sqlite";
import { useEffect, useState } from "react";

export default function TabsLayout() {
  const auth = useAuth();

  if (!auth.user) {
    console.log("Not signed in, redirecting to auth");
    return <Redirect href={"/(auth)"} />;
  }

  // Check if user has set their name
  if (!auth.user.user_metadata?.real_name) {
    console.log("No name set, redirecting to name setup");
    return <Redirect href={"/(setup)/setName"} />;
  }

  if (typeof auth.gymGoal === "undefined") {
    console.log("No gym goal, redirecting");
    return <Redirect href={"/(setup)/setGoal"} />;
  }

  const [shouldRedirect, setRedirect] = useState(false);
  useEffect(() => {
    enrolledGyms().then((gyms) => {
      if (gyms.length === 0) {
        setRedirect(true);
      }
    });
  }, []);

  if (shouldRedirect) {
    console.log("User has not enrolled in any gyms- redirecting");
    return <Redirect href="/(setup)/setGym" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="leaderboard" />
    </Stack>
  );
}
