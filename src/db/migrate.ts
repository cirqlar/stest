import { DB, type Transaction } from '@op-engineering/op-sqlite';
import { Migration } from './types';

export async function check_migrated(db: DB, name: string): Promise<boolean> {
	let { rows } = await db.execute(
		`SELECT COUNT(*) as count FROM migrations 
			WHERE name = ?`,
		[name],
	);
	return !(rows?.[0].count === 0);
}

export async function run_migration(tx: Transaction, migration: Migration) {
	if (typeof migration.query === 'string') {
		await tx.execute(migration.query);
	}
}

export async function log_migration(tx: Transaction, migration: Migration) {
	await tx.execute(
		`INSERT INTO migrations (name)
			VALUES (?)`,
		[migration.name],
	);
}
