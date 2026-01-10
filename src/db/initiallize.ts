import { type DB } from '@op-engineering/op-sqlite';

async function intitialize_db(db: DB) {
	await db.execute(`
		CREATE TABLE IF NOT EXISTS migrations (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT UNIQUE,
			applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)
	`);
}

export default intitialize_db;
