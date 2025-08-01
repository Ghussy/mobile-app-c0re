import { session$ } from "./session";
import { observable, when } from "@legendapp/state";
import { customSynced, sqlitePlugin } from ".";
import { activities$, activity_logs$ } from "./activity_logs";
import { Tables } from "@/types/database.types";

interface ComputedStreak extends Tables<"activity_streaks"> {
  activityName: string;
  daysCompletedThisWeek: number;
}

export const streaks$ = observable(
  customSynced({
    collection: "activity_streaks",
    filter: (q) => {
      const uid = session$.user.get()?.id;
      return uid ? q.eq("user_id", uid) : q.limit(0);
    },
    select: (q) =>
      q.select(
        "id, user_id, activity_id,streak_goal,current_streak,longest_streak,last_completed_week,created_at,updated_at,deleted"
      ),
    as: "Map",
    actions: ["read", "update", "create", "delete"],
    realtime: true,
    persist: {
      name: "streaks",
      plugin: sqlitePlugin,
      retrySync: true,
    },
    retry: { infinite: true },
    waitFor: () => when(session$.user),
  })
);

export function getStreak(streakId: string) {
  return streaks$[streakId];
}

export function setStreakGoal(
  goal: number,
  streakId: string,
  activityId?: string
) {
  if (!streaks$.peek()) return;
  console.log(
    `setStreakGoal: Updating streak_goal for streak ${streakId} from ${streaks$[
      streakId
    ].streak_goal.peek()} to ${goal}`
  );
  streaks$[streakId].streak_goal.set(goal);
}

export const computedStreaks$ = observable(async () => {
  console.log("--- COMPUTEDSTREAKS$ RE-EVALUATING ---");
  await when(activities$);
  await when(streaks$);
  await when(activity_logs$);

  const currentStreaks = streaks$.get();
  const currentActivities = activities$.get();
  const currentActivityLogs = activity_logs$.get();

  console.log("currentActivities (in computed):", currentActivities.size);
  console.log("currentStreaks (in computed):", currentStreaks.size);
  console.log("currentActivityLogs (in computed):", currentActivityLogs.size);
  console.log("-------------------------------------");

  // --- Date Calculation for Current Week ---
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(
    now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1)
  );
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  const computedMap = new Map<string, ComputedStreak>();

  currentStreaks.forEach((streak) => {
    const activityId = streak.activity_id;
    const activity = activityId ? currentActivities.get(activityId) : undefined;

    let daysCompletedThisWeek = 0;
    const uniqueDaysLogged = new Set<string>();

    currentActivityLogs.forEach((log) => {
      if (activity && log.activity_id === activity.id && log.completed_at) {
        const logDate = new Date(log.completed_at);
        if (logDate >= startOfWeek && logDate < endOfWeek) {
          uniqueDaysLogged.add(logDate.toISOString().substring(0, 10));
        }
      }
    });

    daysCompletedThisWeek = uniqueDaysLogged.size;

    computedMap.set(streak.id, {
      ...streak,
      activityName: activity?.name || "Unknown Activity",
      daysCompletedThisWeek: daysCompletedThisWeek,
    });
  });

  console.log("computedMap", computedMap);

  return computedMap;
});

export const sortedComputedStreaksArray$ = observable(() => {
  const computedStreaks = computedStreaks$.get();

  if (!computedStreaks || computedStreaks.size === 0) return [];

  const allComputedStreaks = Array.from(computedStreaks.values());

  return allComputedStreaks.sort((a, b) => {
    return a.activityName.localeCompare(b.activityName);
  });
});
