import { DB } from '@op-engineering/op-sqlite';
import { create } from 'zustand';

import { db, empty_db, intitialize_db, migrate_db } from '../db';
import migrations from '../db/migrations';

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

		try {
			migrate_db(database, percent =>
				set(() => ({
					initialization_progress: (percent + 1) / migrations.length,
				})),
			);
		} catch (e) {
			console.log('Error running migrations', e);
			set(() => ({ state: 'error' }));

			return;
		}

		set(() => ({ state: 'initialized' }));
	},
	reset_db: async () => {
		if (get().state !== 'initialized' && get().state !== 'error') {
			return;
		}

		set({ state: 'uninitialized' });

		try {
			await empty_db(get().db);

			await get().initialize();
		} catch (e) {
			console.log('Error resetting database', e);
		}
	},
}));

export default useDB;
