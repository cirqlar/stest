import { open, DB } from '@op-engineering/op-sqlite';

import { MIGRATIONS_TABLE, tables } from '@/db/tables';
import migrations from '@/db/migrations';

export const db_name = 'stest_test_01';

export const db = open({
	name: `${db_name}.sqlite`,
});

export async function intitialize_db(database: DB) {
	await database.execute(`
		CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT UNIQUE,
			applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)
	`);

	await database.execute(
		`CREATE INDEX IF NOT EXISTS migrations_name_idx ON migrations (name)`,
	);
}

export async function check_migrated(
	database: DB,
	name: string,
): Promise<boolean> {
	let { rows } = await database.execute(
		`SELECT COUNT(*) as count FROM ${MIGRATIONS_TABLE} 
			WHERE name = ?`,
		[name],
	);
	return !(rows?.[0].count === 0);
}

export async function migrate_db(
	database: DB,
	onProgress?: (percent: number) => void,
) {
	for (let i = 0; i < migrations.length; i++) {
		const migration = migrations[i];
		try {
			if (await check_migrated(database, migration.name)) {
				continue;
			}

			await database.executeBatch([
				...(typeof migration.query === 'function'
					? migration.query()
					: migration.query),
				[
					`INSERT INTO ${MIGRATIONS_TABLE} (name)
								VALUES (?)`,
					[migration.name],
				],
			]);

			onProgress?.((i + 1) / migrations.length);
		} catch (e: any) {
			console.log('Error running migration', migration.name, e);

			throw new Error(
				`Error running migration ${migration.name}: ${
					e.toString?.() ?? e.message ?? e
				}`,
			);
		}
	}
}

export async function empty_db(database: DB) {
	return await database.executeBatch(
		tables.map(table => [`DROP TABLE IF EXISTS ${table}`]),
	);
}
