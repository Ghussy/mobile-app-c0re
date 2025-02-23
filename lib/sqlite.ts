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
  builtin BOOLEAN NOT NULL DEFAULT 0
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

export async function createPlace(
  name: string,
  latitude: number,
  longitude: number,
  builtin: boolean
): Promise<void> {
  await db.runAsync(
    "INSERT INTO places (name, latitude, longitude, builtin) VALUES (?, ?, ?, ?)",
    name,
    latitude,
    longitude,
    builtin ? 1 : 0
  );
}

export async function deletePlace(
  name: string,
  builtin: boolean
): Promise<void> {
  await db.runAsync(
    "DELETE FROM places WHERE name = ? AND builtin = ?",
    name,
    builtin ? 1 : 0
  );
}
