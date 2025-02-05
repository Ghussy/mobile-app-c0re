import SQLite from "react-native-sqlite-storage";

const dbPromise = SQLite.openDatabase({ name: "db.sqlite" });

export async function sql(query: string): Promise<SQLite.ResultSet[]> {
	const db = await dbPromise;
	return db.executeSql(query);
}
