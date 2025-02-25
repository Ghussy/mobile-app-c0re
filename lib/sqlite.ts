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
);

CREATE TABLE IF NOT EXISTS sync_info (
  id INTEGER PRIMARY KEY,
  value DATETIME
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

export async function setLastSync(date: Date): Promise<void> {
  try {
    await db.runAsync(
      "INSERT OR REPLACE INTO sync_info (id, value) VALUES (1, ?)",
      date.toISOString()
    );
  } catch (e) {
    console.error(e);
  }
}

export async function lastSync(): Promise<Date | undefined> {
  const result = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM sync_info WHERE id = 1"
  );

  if (!result) {
    return undefined;
  }

  return new Date(result.value);
}

export async function daysWithinLocation(
  dayHistory: number,
  latitude: number,
  longitude: number,
  withinDistance: number
): Promise<Date[]> {
  const haversineQuery = `                                                                                        
     (6371000 * acos(
       cos(radians(?)) *
       cos(radians(latitude)) *
       cos(radians(longitude) - radians(?)) +
       sin(radians(?)) *
       sin(radians(latitude))
     )) AS distance
   `;

  const query = `
    SELECT
       datetime(timestamp, 'start of day') as day,
       MIN(${haversineQuery}) as min_distance
     FROM
       location_history
     WHERE
       timestamp >= date('now', '-${dayHistory} days')
     GROUP BY
       day
     HAVING
       min_distance >= ?
     ORDER BY
       day DESC
   `;

  try {
    const results = await db.getAllAsync<{ day: string; min_distance: number }>(
      query,
      latitude,
      longitude,
      latitude,
      withinDistance
    );

    return results.map((result) => new Date(result.day));
  } catch (e) {
    console.error(e);
  }

  return [];
}
