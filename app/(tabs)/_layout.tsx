import { Stack, Redirect } from "expo-router";
import { profile$, streaks$ } from "@/lib/legendState";
import { locations$ } from "@/lib/legendState/locations";
import { session$ } from "@/lib/legendState/session";
import { use$ } from "@legendapp/state/react";

export default function TabsLayout() {
  const user = use$(session$.user);
  const name = use$(profile$.name);
  // const streakGoal = use$(streaks$[0].streak_goal);
  const locationsObj = use$(locations$);

  const locationsLoaded = locationsObj !== undefined;
  const locationsEmpty =
    locationsLoaded &&
    Object.values(locationsObj).filter(
      (l): l is NonNullable<typeof l> => !!l && !l.deleted
    ).length === 0;

  if (!user) return <Redirect href="/(auth)" />;

  if (!name) return <Redirect href="/(setup)/setName" />;
  // if (streakGoal === undefined) return <Redirect href="/(setup)/setGoal" />;
  if (locationsLoaded && locationsEmpty) return <Redirect href="/(setup)/setGym" />;

  // Happy path
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
    </Stack>
  );
}
