import { Stack } from "expo-router";

export default function SetupLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="setName" />
      <Stack.Screen name="setGoal" />
      <Stack.Screen name="setGym" />
    </Stack>
  );
}
