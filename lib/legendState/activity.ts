import { observable } from "@legendapp/state";
import { customSynced, sqlitePlugin } from ".";
import { session$ } from "./session";
import { v4 as uuidv4 } from "uuid";

export const activity$ = observable(
  customSynced({
    collection: "activities",
    filter: (q) => {
      const uid = session$.user.get()?.id;
      return uid ? q.eq("creator", uid) : q.limit(0);
    },
    select: (q) => q.select("id, name, creator"),
    actions: ["read", "create", "update", "delete"],
    realtime: true,
    persist: {
      name: "activities",
      retrySync: true,
      plugin: sqlitePlugin,
    },
  }),
);

const generateId = () => uuidv4();

export function createActivity(data: { name: string }) {
  const uid = session$.user.get()?.id;
  if (!uid) return console.warn("createActivity called with no user session");

  const id = generateId();

  activity$[id].set({
    id: id,
    name: data.name,
    creator: uid,
  });
}
