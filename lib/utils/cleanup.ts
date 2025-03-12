import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SQLite from "expo-sqlite";

export async function cleanupLocalData() {
  try {
    // Clear AsyncStorage
    await AsyncStorage.clear();

    // Clear SQLite database
    const db = SQLite.openDatabaseSync("db.sqlite");

    // Drop all tables
    await db.execAsync(`
      DROP TABLE IF EXISTS location_history;
      DROP TABLE IF EXISTS gyms;
    `);

    // Recreate tables with fresh schema
    await db.execAsync(`
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
        builtin BOOLEAN NOT NULL,
        address TEXT
      );
    `);

    console.log("Successfully cleaned up local data");
  } catch (error) {
    console.error("Error cleaning up local data:", error);
    throw error;
  }
}
