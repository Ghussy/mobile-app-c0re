import { observable, when } from "@legendapp/state";
import { customSynced } from ".";
import { session$ } from "./session";
import { Tables } from "../../types/database.types";
import { v4 as uuidv4 } from "uuid";

export const activity_logs$ = observable(
  customSynced({
    collection: "activity_logs",
    filter: (q) => {
      const uid = session$.user.get()?.id;
      return uid ? q.eq("user_id", uid) : q.limit(0);
    },
    select: (q) => q.select("*"),
    actions: ["read", "create", "update", "delete"],
    as: "Map",
    realtime: true,
    persist: { name: "activity_logs", retrySync: true },
    retry: { infinite: true },
    waitFor: () => when(session$.user),
  })
);

export const activities$ = observable(
  customSynced({
    collection: "activities",
    select: (q) => q.select("id, name, created_at,updated_at,deleted"),
    actions: ["read", "create", "update", "delete"],
    as: "Map",
    realtime: true,
    persist: { name: "activities", retrySync: true },
    retry: { infinite: true },
  })
);

type ActivityLogFunctionParams = {
  notes?: string | null;
  completed_at?: string | Date;
  duration_minutes?: number | null;
  source?: string | null;
  metrics?: Record<string, any> | null;
};

export function logActivity(
  activityId: string,
  params: ActivityLogFunctionParams = {}
) {
  const uid = session$.user.peek()?.id;
  if (!uid) {
    console.warn("logActivity: No user session found. Activity not logged.");
    return;
  }

  const currentLogs = activity_logs$.get();
  if (!currentLogs) {
    console.error("activity_logs$ is not initialized");
    return;
  }

  const newLogId = uuidv4();

  let completedAtISO: string;
  if (params.completed_at) {
    completedAtISO =
      params.completed_at instanceof Date
        ? params.completed_at.toISOString()
        : new Date(params.completed_at).toISOString();
  } else {
    completedAtISO = new Date().toISOString();
  }

  const optimisticRowData: Tables<"activity_logs"> = {
    id: newLogId,
    user_id: uid,
    activity_id: activityId,
    completed_at: completedAtISO,
    notes: params.notes === undefined ? null : params.notes,
    duration_minutes:
      params.duration_minutes === undefined ? null : params.duration_minutes,
    source: params.source === undefined ? null : params.source,
    metrics: params.metrics === undefined ? null : params.metrics,
    created_at: null,
    updated_at: null,
    deleted: false,
  };

  activity_logs$[newLogId].set(optimisticRowData);
}
