import { type Transaction } from '@op-engineering/op-sqlite';
import { Migration } from './migrations/types';

export async function check_migrated(
	tx: Transaction,
	migration: Migration,
): Promise<boolean> {
	let { rows } = await tx.execute(
		`SELECT COUNT(*) FROM migrations 
			WHERE name = ?`,
		[migration.name],
	);

	return !(rows?.[0].count === 0);
}

export async function run_migration(tx: Transaction, migration: Migration) {
	await tx.execute(migration.query);
}

export async function log_migration(tx: Transaction, migration: Migration) {
	await tx.execute(
		`INSERT INTO migrations (name)
			VALUES (?)`,
		[migration.name],
	);
}
