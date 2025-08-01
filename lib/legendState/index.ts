import { observable, when } from "@legendapp/state";
import { configureSynced } from "@legendapp/state/sync";
import { syncedSupabase } from "@legendapp/state/sync-plugins/supabase";
import { observablePersistSqlite } from "@legendapp/state/persist-plugins/expo-sqlite";
import Storage from "expo-sqlite/kv-store";
import { supabase } from "../supabaseClient";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { session$ } from "./session";
import dayjs from "dayjs";
import { TablesInsert } from "@/types/database.types";
import { Tables } from "@/types/database.types";

const generateId = () => uuidv4();

export const customSynced = configureSynced(syncedSupabase, {
  persist: {
    plugin: observablePersistSqlite(Storage),
    // retrySync: true,
  },
  //   retry: { infinite: true },
  generateId,
  supabase,
  changesSince: "last-sync",
  fieldCreatedAt: "created_at",
  fieldUpdatedAt: "updated_at",
  fieldDeleted: "deleted", // Optionally enable soft deletes
});

export const sqlitePlugin = observablePersistSqlite(Storage);

export const users$ = observable(
  customSynced({
    supabase,
    collection: "users",
    select: (from) =>
      from.select(
        "id,discord_name,name,avatar_url,created_at,updated_at,deleted"
      ),
    actions: ["read", "create", "update", "delete"],
    realtime: true,
    persist: {
      name: "users",
      retrySync: true,
    },
    retry: {
      infinite: true,
    },
    waitFor: () => when(session$.user),
  })
);

export const profile$ = observable(
  customSynced({
    collection: "users",
    filter: (q) => {
      const uid = session$.user.get()?.id;
      return uid ? q.eq("id", uid) : q.limit(0);
    },
    select: (q) =>
      q.select("id,discord_name,name,avatar_url,created_at,updated_at"),
    actions: ["read", "update", "create", "delete"],
    as: "value",
    realtime: true,
    persist: { name: "profile", retrySync: true },
    retry: { infinite: true },
    waitFor: () => when(session$.user),
  })
);

export function setRealName(name: string) {
  if (!profile$.peek()) return;
  profile$.name.set(name);
}
