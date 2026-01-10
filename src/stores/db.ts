import { DB } from '@op-engineering/op-sqlite';
import { create } from 'zustand';
import { db } from '../db';
import intitialize_db from '../db/initiallize';
import migrations from '../db/migrations';
import { check_migrated, log_migration, run_migration } from '../db/migrate';

type DBState = {
	db: DB;
	state:
		| 'uninitialized'
		| 'initializing'
		| 'migrating'
		| 'seeding'
		| 'initialized';
	initialization_progress: number;
	initialize: () => Promise<void>;
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

		database.transaction(async tx => {
			for (let i = 0; i < migrations.length; i++) {
				const migration = migrations[i];

				if (!(await check_migrated(tx, migration))) {
					await run_migration(tx, migration);
					await log_migration(tx, migration);
					console.log(`Finished running ${migration.name}`);
				} else {
					console.log(`${migration.name} has already run`);
				}

				set(() => ({
					initialization_progress: (i + 1) / migrations.length,
				}));
			}
		});

		set(() => ({ state: 'initialized' }));
	},
}));

export default useDB;
