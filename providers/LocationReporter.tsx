import { useEffect } from "react";

import BackgroundGeolocation from "react-native-background-geolocation";

import { lastSync, logLocation } from "@/lib/sqlite";
import { supabase } from "@/lib/supabase";

const BACKEND_UPDATE_FREQUENCY = 1000 * 60 * 60 * 4;

async function syncIfNeeded() {
  const lastUpdate = await lastSync();
  const now = new Date();
  if (
    lastUpdate !== undefined &&
    now.getTime() - lastUpdate.getTime() < BACKEND_UPDATE_FREQUENCY
  ) {
    return;
  }

  supabase.functions.invoke("update-leaderboard");
}

export function LocationReporter() {
  useEffect(() => {
    BackgroundGeolocation.ready({
      startOnBoot: true,
      stopOnTerminate: false,
      enableHeadless: true,
    }).then(() => {
      BackgroundGeolocation.start();
      BackgroundGeolocation.registerHeadlessTask(async () => {
        try {
          const { coords } = await BackgroundGeolocation.getCurrentPosition({
            persist: false,
          });
          await logLocation(coords.latitude, coords.longitude, coords.speed);
          await syncIfNeeded();
        } catch (error) {
          console.error("Error fetching location:", error);
        }
      });

      BackgroundGeolocation.onLocation(async (location) => {
        const { coords } = location;
        await logLocation(coords.latitude, coords.longitude, coords.speed);
        await syncIfNeeded();
      });
    });
  }, []);

  return null;
}
