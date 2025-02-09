import { useEffect } from "react";

import BackgroundGeolocation from "react-native-background-geolocation";

import { logLocation } from "@/lib/sqlite";

export function LocationReporter() {
  useEffect(() => {
    BackgroundGeolocation.ready({
      startOnBoot: true,
      stopOnTerminate: false,
      enableHeadless: true,
    }).then(() => {
      BackgroundGeolocation.start();
      BackgroundGeolocation.registerHeadlessTask(async (event) => {
        try {
          const { coords } = await BackgroundGeolocation.getCurrentPosition({
            persist: false,
          });
          await logLocation(coords.latitude, coords.longitude, coords.speed);
        } catch (error) {
          console.error("Error fetching location:", error);
        }
      });

      BackgroundGeolocation.onLocation(async (location) => {
        const { coords } = location;
        await logLocation(coords.latitude, coords.longitude, coords.speed);
      });
    });
  }, []);

  return null;
}
