import { db, intitialize_db } from '@/db';

import migrations from '@/db/migrations';

jest.mock('@op-engineering/op-sqlite', () => {
	return { __esModule: true, open: () => {} };
});

jest.mock('@/db', () => {
	const datab = jest.requireActual('@/__tests__/mocks/mock_db');
	const orig = jest.requireActual('@/db');

	return {
		__esModule: true,
		...orig,
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
