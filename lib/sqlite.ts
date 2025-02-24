import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("db.sqlite");

db.execSync(
  `
PRAGMA journal_mode = WAL;
CREATE TABLE IF NOT EXISTS location_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  speed REAL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gyms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  builtin BOOLEAN NOT NULL
);`
);

function nullIfUndefined<T>(t: T | undefined): T | null {
  return t === undefined ? null : t;
}

export async function logLocation(
  latitude: number,
  longitude: number,
  speed: number | undefined
) {
  await db.runAsync(
    "INSERT INTO location_history (latitude, longitude, speed) VALUES (?, ?, ?)",
    latitude,
    longitude,
    nullIfUndefined(speed)
  );
}

export async function getRecentLocations(limit: number = 50): Promise<
  Array<{
    latitude: number;
    longitude: number;
    speed: number;
    timestamp: string;
  }>
> {
  return db.getAllAsync(
    "SELECT * FROM location_history ORDER BY timestamp DESC LIMIT ?",
    limit
  );
}

export interface Gym {
  name: string;
  builtin: boolean;
}

export async function enrollGym(
  name: string,
  latitude: number,
  longitude: number,
  builtin: boolean
): Promise<void> {
  await db.runAsync(
    "INSERT INTO gyms (name, latitude, longitude, builtin) VALUES (?, ?, ?, ?)",
    name,
    latitude,
    longitude,
    builtin ? 1 : 0
  );
}

export async function unenrollGym(
  name: string,
  builtin: boolean
): Promise<void> {
  await db.runAsync(
    "DELETE FROM gyms WHERE name = ? AND builtin = ?",
    name,
    builtin ? 1 : 0
  );
}

export async function enrolledGyms(): Promise<Gym[]> {
  const gyms = await db.getAllAsync("SELECT name, builtin FROM gyms");

  return gyms.map((gym) => ({
    ...(gym as any as Gym),
    builtin: (gym as any).builtin === 1,
  }));
}
