// db.ts  –  Expo SQLite + Legend-State local-first schema
//------------------------------------------------------------
import * as SQLite from "expo-sqlite";
import dayjs from "dayjs";

const db = SQLite.openDatabaseSync("db.sqlite");

///////////////////////////////////////////////////////////////////////////////
// Schema  (all CREATE … IF NOT EXISTS are idempotent)
///////////////////////////////////////////////////////////////////////////////
db.execSync(`
PRAGMA journal_mode = WAL;

/* 1. Optional raw GPS log (handy for debugging) */
CREATE TABLE IF NOT EXISTS location_history (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  latitude    REAL NOT NULL,
  longitude   REAL NOT NULL,
  speed       REAL,
  timestamp   DATETIME DEFAULT CURRENT_TIMESTAMP
);

/* 2. User-defined gyms / climbing gyms */
CREATE TABLE IF NOT EXISTS local_gyms (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  latitude    REAL    NOT NULL,
  longitude   REAL    NOT NULL,
  radius_m    INTEGER NOT NULL DEFAULT 150,
  builtin     BOOLEAN NOT NULL,                      -- shipped default gyms?
  address     TEXT,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

/* 3. School clubs (Discord guilds cache) */
CREATE TABLE IF NOT EXISTS local_clubs (
  id               INTEGER PRIMARY KEY,
  discord_guild_id TEXT    NOT NULL UNIQUE,
  name             TEXT    NOT NULL,
  icon_url         TEXT,
  updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP
);

/* 4. Visit queue  (Legend-State will sync rows whose synced = 0) */
CREATE TABLE IF NOT EXISTS local_visits (
  id          TEXT PRIMARY KEY,         -- UUID
  user_id     TEXT NOT NULL,
  gym_id      INTEGER NOT NULL,
  entered_at  DATETIME NOT NULL,
  exited_at   DATETIME,
  source      TEXT    NOT NULL DEFAULT 'auto',   -- 'auto' | 'manual'
  synced      BOOLEAN NOT NULL DEFAULT 0
);

/* 5. Streak snapshot – single row, instant UI */
CREATE TABLE IF NOT EXISTS local_streaks (
  id         INTEGER PRIMARY KEY CHECK (id = 1),
  current    INTEGER NOT NULL DEFAULT 0,
  longest    INTEGER NOT NULL DEFAULT 0,
  last_visit DATE,
  synced     BOOLEAN NOT NULL DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT OR IGNORE INTO local_streaks(id) VALUES (1);

/* 6. Misc key/value store */
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  val TEXT
);
`);

///////////////////////////////////////////////////////////////////////////////
// Tiny helpers
///////////////////////////////////////////////////////////////////////////////
const nil = <T,>(v: T | undefined): T | null => (v === undefined ? null : v);

///////////////////////////////////////////////////////////////////////////////
// Location debug log  (optional)
///////////////////////////////////////////////////////////////////////////////
export const logLocation = async (
  lat: number,
  lng: number,
  speed?: number
) =>
  db.runAsync(
    `INSERT INTO location_history (latitude, longitude, speed) VALUES (?,?,?)`,
    lat,
    lng,
    nil(speed)
  );

///////////////////////////////////////////////////////////////////////////////
// CLUBS  (Discord guild cache)
///////////////////////////////////////////////////////////////////////////////
export interface LocalClub {
  id: number;
  discord_guild_id: string;
  name: string;
  icon_url?: string;
}
export const upsertClub = async (c: LocalClub) =>
  db.runAsync(
    `INSERT INTO local_clubs (id,discord_guild_id,name,icon_url)
     VALUES (?,?,?,?)
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name,
       icon_url = excluded.icon_url,
       updated_at = CURRENT_TIMESTAMP`,
    c.id,
    c.discord_guild_id,
    c.name,
    nil(c.icon_url)
  );
export const getLocalClubs = () =>
  db.getAllAsync<LocalClub>(`SELECT * FROM local_clubs`);

///////////////////////////////////////////////////////////////////////////////
// GYMS  (user-owned)
///////////////////////////////////////////////////////////////////////////////
export interface LocalGym {
  id?: number;
  name: string;
  latitude: number;
  longitude: number;
  radius_m?: number;
  builtin?: boolean;
  address?: string;
}
export const upsertGym = async (g: LocalGym) =>
  db.runAsync(
    `INSERT INTO local_gyms
       (id,name,latitude,longitude,radius_m,builtin,address)
     VALUES (?,?,?,?,?,?,?)
     ON CONFLICT(id) DO UPDATE SET
       name      = excluded.name,
       latitude  = excluded.latitude,
       longitude = excluded.longitude,
       radius_m  = excluded.radius_m,
       builtin   = excluded.builtin,
       address   = excluded.address,
       updated_at= CURRENT_TIMESTAMP`,
    nil(g.id),
    g.name,
    g.latitude,
    g.longitude,
    g.radius_m ?? 150,
    g.builtin ? 1 : 0,
    nil(g.address)
  );
export const getLocalGyms = async () => {
  const rows = await db.getAllAsync<any>(`SELECT * FROM local_gyms`);
  return rows.map((r) => ({ ...r, builtin: !!r.builtin })) as LocalGym[];
};

///////////////////////////////////////////////////////////////////////////////
// VISITS  +  local streak maintenance
///////////////////////////////////////////////////////////////////////////////
export type VisitSource = "auto" | "manual";

/** Insert a visit row *and* update the local streak snapshot. */
export const queueVisit = async (
  uuid: string,
  user_id: string,
  gym_id: number,
  entered_at: string,
  exited_at?: string,
  source: VisitSource = "auto"
) => {
  await db.runAsync(
    `INSERT INTO local_visits
       (id,user_id,gym_id,entered_at,exited_at,source,synced)
     VALUES (?,?,?,?,?, ?,0)`,
    uuid,
    user_id,
    gym_id,
    entered_at,
    nil(exited_at),
    source
  );
  await recomputeLocalStreak();
};

export const getUnsyncedVisits = () =>
  db.getAllAsync(`SELECT * FROM local_visits WHERE synced = 0`);
export const markVisitSynced = (id: string) =>
  db.runAsync(`UPDATE local_visits SET synced = 1 WHERE id = ?`, id);

///////////////////////////////////////////////////////////////////////////////
// Streak snapshot helpers
///////////////////////////////////////////////////////////////////////////////
interface LocalStreak {
  current: number;
  longest: number;
  last_visit?: string;
  synced: boolean;
}
export const getLocalStreak = async (): Promise<LocalStreak> => {
  const [row] = await db.getAllAsync<any>(`SELECT * FROM local_streaks LIMIT 1`);
  return row as LocalStreak;
};

/** Re-compute streak instantly after *every* visit insert. */
export const recomputeLocalStreak = async () => {
  const [s] = await db.getAllAsync<any>(`SELECT * FROM local_streaks LIMIT 1`);
  const today = dayjs().format("YYYY-MM-DD");
  if (s?.last_visit === today) return;   // already accounted for

  const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");
  const newCurrent = s?.last_visit === yesterday ? s.current + 1 : 1;
  const newLongest = Math.max(newCurrent, s?.longest ?? 0);

  await db.runAsync(
    `UPDATE local_streaks
       SET current = ?, longest = ?, last_visit = ?, synced = 0,
           updated_at = CURRENT_TIMESTAMP
     WHERE id = 1`,
    newCurrent,
    newLongest,
    today
  );
};
