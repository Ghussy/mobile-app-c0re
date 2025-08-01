import { session$ } from "./session";
import { observable, when } from "@legendapp/state";
import { customSynced, sqlitePlugin } from ".";
import { v4 as uuidv4 } from "uuid";
import { TablesInsert } from "@/types/database.types";

type LocationInsert = TablesInsert<"locations">;
type SaveLocationPayload = Pick<
  LocationInsert,
  | "name"
  | "latitude"
  | "longitude"
  | "address"
  | "radius_m"
  | "default_activity_id"
>;

export const locations$ = observable(
  customSynced({
    collection: "locations",
    filter: (q) => {
      const uid = session$.user.get()?.id;
      return uid ? q.eq("user_id", uid) : q.limit(0);
    },
    select: (q) =>
      q.select(
        "id, user_id, name, latitude, longitude, radius_m, address, default_activity_id, created_at, updated_at, deleted"
      ),
    actions: ["read", "create", "update", "delete"],
    realtime: true,
    persist: {
      name: "locations",
      retrySync: true,
      plugin: sqlitePlugin,
    },
    retry: {
      infinite: true,
    },
    waitFor: () => when(session$.user),
  })
);

const generateId = () => uuidv4();

export function saveLocation(data: SaveLocationPayload) {
  const uid = session$.user.get()?.id;
  if (!uid) return console.warn("saveLocation called with no user session");

  const id = generateId();

  const locationData = {
    id: id,
    user_id: uid,
    name: data.name,
    latitude: data.latitude,
    longitude: data.longitude,
    radius_m: data.radius_m ?? null,
    address: data.address ?? null,
    default_activity_id: data.default_activity_id ?? null,
  };

  locations$[id].set(locationData);
}
