import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import { fetch } from "expo/fetch";

import { useColorScheme } from "@/hooks/useColorScheme";

import BackgroundGeolocation from "react-native-background-geolocation";

BackgroundGeolocation.ready({
  startOnBoot: true,
  stopOnTerminate: false,
  enableHeadless: true,
}).then(() => {
  BackgroundGeolocation.start();
  BackgroundGeolocation.registerHeadlessTask(async (event) => {
    try {
      const location = await BackgroundGeolocation.getCurrentPosition({
        persist: false,
      });
      const coords = location.coords;
      const message = `(while the app is closed) Richard is at ${coords.latitude}, ${coords.longitude}, travelling at ${coords.speed} m/s`;
      fetch(
        "https://discord.com/api/webhooks/1326401299289473116/tMji7ZF64F-qZhfHctvXsinLnYYf-y3mbhAVYiDA_bf3vje8H015UEWc_iSOm5ur3lK5",
        {
          method: "POST",
          body: JSON.stringify({
            content: message,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
        .catch(console.error)
        .then(console.log);
    } catch (error) {
      console.error("Error fetching location:", error);
    }
  });
  BackgroundGeolocation.onLocation((location) => {
    console.log("location:", location);
    const coords = location.coords;
    const message = `Richard is at ${coords.latitude}, ${coords.longitude}, travelling at ${coords.speed} m/s`;
    fetch(
      "https://discord.com/api/webhooks/1326401299289473116/tMji7ZF64F-qZhfHctvXsinLnYYf-y3mbhAVYiDA_bf3vje8H015UEWc_iSOm5ur3lK5",
      {
        method: "POST",
        body: JSON.stringify({
          content: message,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .catch(console.error)
      .then(console.log);
  });
});

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
