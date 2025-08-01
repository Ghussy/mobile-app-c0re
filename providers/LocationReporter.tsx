import { useEffect, useState } from "react";
import BackgroundGeolocation, {
  Geofence,
  GeofenceEvent,
} from "react-native-background-geolocation";
import { logLocation } from "@/lib/sqlite";
import { Tables } from "@/types/database.types";
import { logActivity } from "@/lib/legendState/activity_logs";
import { locations$ } from "@/lib/legendState/locations";
import { use$ } from "@legendapp/state/react";

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
  const locations = use$(locations$);

  useEffect(() => {
    console.log("Active locations changed, syncing geofences...");
    syncGeofencesFromLocations();
  }, [locations]);

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
    })
      .then(() => {
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

        BackgroundGeolocation.onGeofence(async (event: GeofenceEvent) => {
          console.log("[geofence] ", event.action, event.identifier);

          if (event.action === "ENTER") {
            const locationId = event.identifier;
            const timestamp = event.location.timestamp;
            const locationData = locations$[locationId]?.get();
            const locationName = locationData?.name || `location ${locationId}`;
            let activityIdToLog = undefined;

            if (
              locationData &&
              typeof locationData.default_activity_id === "string"
            ) {
              activityIdToLog = locationData.default_activity_id;
              console.log(
                `Using default_activity_id ${activityIdToLog} for location ${locationName}`
              );
            } else {
              console.warn(
                `No default_activity_id set for location ${locationName}. Consider a generic log or no log.`
              );
              if (!activityIdToLog) {
                console.log(
                  `No specific or default activity to log for geofence entry at ${locationName}. Skipping auto-log.`
                );
                return;
              }
            }

            try {
              await logActivity(activityIdToLog, {
                completed_at: timestamp,
                source: "geofence",
                notes: `Auto-logged entry at ${locationName}`,
              });
              console.log(
                `Logged activity ID ${activityIdToLog} for entering ${locationName} (ID: ${locationId}) at ${timestamp}`
              );
            } catch (error) {
              console.error("Error logging geofence activity:", error);
            }
          }
        });

        syncGeofencesFromLocations();
      })
      .catch((error) => {
        console.error("BG Geolocation ready error:", error);
      });

    return () => {
      BackgroundGeolocation.removeListeners();
    };
  }, [debugEnabled]);

  return null;
}

export function syncGeofencesFromLocations() {
  const locationsObject = locations$.get() ?? {};
  const locationsArray = Object.values(
    locationsObject
  ) as Tables<"locations">[];

  const validLocations = locationsArray.filter(
    (l) =>
      l &&
      l.id &&
      typeof l.latitude === "number" &&
      isFinite(l.latitude) &&
      typeof l.longitude === "number" &&
      isFinite(l.longitude)
  );

  const geos: Geofence[] = validLocations.map((l) => ({
    identifier: l.id,
    latitude: l.latitude,
    longitude: l.longitude,
    radius:
      typeof l.radius_m === "number" && isFinite(l.radius_m) ? l.radius_m : 150,
    notifyOnEntry: true,
    notifyOnExit: false,
    notifyOnDwell: false,
  }));

  BackgroundGeolocation.removeGeofences()
    .then(() => {
      if (geos.length > 0) {
        BackgroundGeolocation.addGeofences(geos).catch((error) => {
          console.error("Failed to add geofences:", error);
        });
      }
    })
    .catch((error) => {
      console.error("Failed to remove geofences:", error);
    });
}
