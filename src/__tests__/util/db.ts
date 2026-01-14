import { DB } from '@op-engineering/op-sqlite';

import { intitialize_db, migrate_db } from '@/db';

export async function setupDB(db: DB) {
	await intitialize_db(db);
	await migrate_db(db);
}
