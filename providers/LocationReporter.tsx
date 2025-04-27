import { useEffect, useState } from "react";

import BackgroundGeolocation from "react-native-background-geolocation";

import { logLocation } from "@/lib/sqlite";

export const getCurrentLocation = async () => {
  return BackgroundGeolocation.getCurrentPosition({
    persist: false,
    samples: 1,
  });
};

export const setDebugMode = async (enabled: boolean) => {
  return BackgroundGeolocation.setConfig({
    debug: enabled,
    logLevel: enabled
      ? BackgroundGeolocation.LOG_LEVEL_VERBOSE
      : BackgroundGeolocation.LOG_LEVEL_OFF,
  });
};

export function LocationReporter() {
  const [debugEnabled, setDebugEnabled] = useState(false);

  useEffect(() => {
    BackgroundGeolocation.ready({
      startOnBoot: true,
      stopOnTerminate: false,
      enableHeadless: true,
      useSignificantChangesOnly: false, // ios defaults stationaryRadius to 500 when enabled
      stopOnStationary: true,
      stationaryRadius: 100,
      distanceFilter: 50, //default is 10
      debug: debugEnabled,
      logLevel: debugEnabled
        ? BackgroundGeolocation.LOG_LEVEL_VERBOSE
        : BackgroundGeolocation.LOG_LEVEL_OFF,
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
  }, [debugEnabled]);

  return null;
}
