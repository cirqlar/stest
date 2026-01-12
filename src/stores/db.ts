import { DB } from '@op-engineering/op-sqlite';
import { create } from 'zustand';

import { db } from '../db';
import intitialize_db from '../db/initiallize';
import migrations from '../db/migrations';
import { check_migrated } from '../db/migrate';
import { MIGRATIONS_TABLE, tables } from '../db/tables';

type DBState = {
	db: DB;
	state:
		| 'uninitialized'
		| 'initializing'
		| 'migrating'
		| 'seeding'
		| 'initialized'
		| 'error';
	initialization_progress: number;
	initialize: () => Promise<void>;
	reset_db: () => Promise<void>;
};

const useDB = create<DBState>()((set, get) => ({
	db: db,
	state: 'uninitialized',
	initialization_progress: 0,
	initialize: async () => {
		const { db: database, state } = get();
		if (state !== 'uninitialized') {
			console.log(`DB is already in ${state} state`);
			return;
		}
		set(() => ({ state: 'initializing' }));

		await intitialize_db(database);

		set(() => ({ state: 'migrating' }));

		for (let i = 0; i < migrations.length; i++) {
			const migration = migrations[i];
			try {
				if (await check_migrated(db, migration.name)) {
					continue;
				}

				await db.executeBatch([
					...(typeof migration.query === 'function'
						? migration.query()
						: migration.query),
					[
						`INSERT INTO ${MIGRATIONS_TABLE} (name)
								VALUES (?)`,
						[migration.name],
					],
				]);

				set(() => ({
					initialization_progress: (i + 1) / migrations.length,
				}));
			} catch (e) {
				console.log('Error running migration', migration.name, e);
				set(() => ({ state: 'error' }));

				return;
			}
		}

		set(() => ({ state: 'initialized' }));
	},
	reset_db: async () => {
		if (get().state !== 'initialized' && get().state !== 'error') {
			return;
		}

		set({ state: 'uninitialized' });

		try {
			await get().db.executeBatch(
				tables.map(table => [`DROP TABLE IF EXISTS ${table}`]),
			);

			await get().initialize();
		} catch (e) {
			console.log('Error resetting database', e);
		}
	},
}));

export default useDB;
