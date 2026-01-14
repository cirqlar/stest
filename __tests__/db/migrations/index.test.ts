import { db } from '../../../src/db/index';
import intitialize_db from '../../../src/db/initiallize';

import migrations from '../../../src/db/migrations';

jest.mock('../../../src/db/index', () => {
	const datab = jest.requireActual('../mock_db');

	return {
		__esModule: true,
		db: new datab.DB(),
	};
});

describe('migrations', () => {
	beforeAll(async () => {
		await intitialize_db(db);
	});

	const seen: string[] = [];
	for (const migration of migrations) {
		test(`migration name ${migration.name} is unique`, () => {
			expect(seen.includes(migration.name)).toBe(false);
			seen.push(migration.name);
		});
	}

	for (const migration of migrations) {
		test(`migration ${migration.name} runs without errors`, async () => {
			if (typeof migration.query === 'function') {
				await db.executeBatch(migration.query());
			} else {
				await db.executeBatch(migration.query);
			}
		});
	}
});
