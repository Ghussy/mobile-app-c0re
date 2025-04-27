# Legend-State: Persist & Sync Engine for Streaks

The Persist & Sync engine in Legend-State can persist your "streak" locally in Expo-SQLite and queue a one-field update to Supabase when the geofence callback fires.

Because the library is 100% JavaScript (no React-only hooks in its core), you can call it from a headless/background task that fires on a geofence event. Pending writes are stored in SQLite and will retry automatically the next time there's network or the app wakes up, so you don't lose the update if the OS kills your task early.

---

## Why it fits your flow

| Requirement                         | Legend-State capability                                                                                                                                                                    |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Offline-first / local calc          | Built-in persistence plugins include Expo SQLite for RN/Expo apps.                                                                                                                         |
| Only sync the streak number         | You can declare a tiny observable (e.g. `streak$`) and attach `syncedSupabase` so only that value is sent. Supabase plugin is first-party.                                                 |
| Retry later if background times out | `retrySync: true` and `retry: { infinite: true }` guarantee queued changes keep trying with exponential back-off.                                                                          |
| Headless/background safe            | State updates are plain JS; they don't depend on React render cycles. As long as the JS runtime is alive (Headless JS on Android or an app relaunch on iOS) the observable can be mutated. |
| Wake JS when a geofence fires       | In `react-native-background-geolocation` set `forceReloadOnGeofence: true` so iOS/Android spin up JS when a geofence ENTER/EXIT happens.                                                   |

---

## End-to-end Sketch

### state.ts

```ts
import { observable } from "@legendapp/state";
import { configureSynced } from "@legendapp/state/sync";
import { syncedSupabase } from "@legendapp/state/sync-plugins/supabase";
import { observablePersistSqlite } from "@legendapp/state/persist-plugins/expo-sqlite";
import Storage from "expo-sqlite/kv-store"; // Expo SDK 50+

// 1. global config: local SQLite + retry
const persistCfg = configureSynced({
  persist: {
    plugin: observablePersistSqlite(Storage),
    retrySync: true, // queue + retry automatically
  },
  retry: { infinite: true },
});

// 2. tiny observable that only stores the streak #
export const streak$ = observable(
  syncedSupabase({
    supabase, // createClient(...) from supabase-js 2.x
    collection: "profiles", // or your streak table
    id: userId, // row PK
    as: "value", // we just care about one scalar
    persist: { name: "streak" },
  })
).extend(persistCfg);
```

---

### geofenceTask.ts – headless task registered with BackgroundGeolocation

```ts
import { streak$ } from "./state";
import * as BackgroundGeolocation from "react-native-background-geolocation";

BackgroundGeolocation.registerHeadlessTask(async (event) => {
  if (event.name === "geofence" && event.geofence?.action === "ENTER") {
    // 1️⃣  Update the streak in memory
    streak$.set((v = 0) => v + 1);

    // 2️⃣  Optionally flush immediately; if you omit this the queued
    //      change will sync on the next app wake / connectivity.
    await streak$.sync?.flush?.(); // legend-state v3 helper
  }
});
```

---

### App bootstrap (e.g. in Root.tsx)

```ts
BackgroundGeolocation.ready(
  {
    // normal config…
    forceReloadOnGeofence: true, // wake JS on geofence
    enableHeadless: true, // android
  },
  (state) => {
    if (!state.enabled) BackgroundGeolocation.startGeofences();
  }
);
```

---

## What happens

- **ENTER geofence** ➜ OS wakes your headless JS task.
- The task increments `streak$`.
- Legend-State writes `{streak: N}` to SQLite immediately and schedules a Supabase PATCH.
- If the network call finishes before the 30s iOS limit (or Android's Doze), you're done; if not, the change is in the pending queue and will retry when:
  - the device comes online, or
  - the app is relaunched/foregrounded.
- Because data is in SQLite, your UI shows the new streak instantly the next time the user opens the app—even if Supabase hasn't confirmed yet.

---

## Caveats & Tips

### JS runtime availability

- **Android:** Headless JS runs without UI; just ensure your task is registered.
- **iOS:** You really need `forceReloadOnGeofence: true` (or schedule a BG fetch) so React-Native spins up JS when the event fires.

### Supabase auth

- In headless mode you may have to restore the user's refresh token/session before calling Supabase. Do that once at the top of the task.

### SQLite on iOS headless

- Expo-SQLite is available in React-Native's JS context, but large writes in a background task still count toward the ~30s limit—keep the operation light.

---

## Bottom line

Legend-State's persist + sync stack (Expo SQLite ⇄ Supabase) is explicitly designed for local-first, offline-robust apps and works fine from background/Headless JS. As long as you wake your JS when the geofence fires and keep the mutation small, you can safely calculate the streak locally and push a single-field update while the phone is still in the user's pocket.
