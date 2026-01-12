import { type DB } from '@op-engineering/op-sqlite';

async function intitialize_db(db: DB) {
	await db.execute(`
		CREATE TABLE IF NOT EXISTS migrations (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT UNIQUE,
			applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)
	`);

	await db.execute(
		`CREATE INDEX IF NOT EXISTS migrations_name_idx ON migrations (name)`,
	);
}

export default intitialize_db;
