import { db } from '@/db';
import { Side, Trade } from '@/db/types';
import { insertOrIgnoreTrade, selectSingleTrade } from '@/db/queries/trades';

import { setupDB } from '@/__tests__/util/db';

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

beforeAll(() => {
	setupDB(db);
});

test('inserting trade with existing tradeId does nothing', async () => {
	const original = {
		tradeId: 'insert',
		marketId: 'market',
		price: 70000,
		size: 10039,
		side: 'sell' as Side,
		timestamp: Date.now(),
	};

	const insert_query = insertOrIgnoreTrade(original);
	await db.execute(insert_query.queryString, insert_query.params);

	const select_query = selectSingleTrade(original.tradeId);
	const saved_1 = (
		await db.execute(select_query.queryString, select_query.params)
	).rows[0] as Trade;

	expect(saved_1).toEqual({ ...original, id: saved_1.id });

	const second = {
		tradeId: original.tradeId,
		marketId: 'market_3',
		price: 102323,
		size: 944,
		side: 'buy' as Side,
		timestamp: Date.now() + 33423,
	};

	const insert_query_2 = insertOrIgnoreTrade(second);
	await db.execute(insert_query_2.queryString, insert_query_2.params);

	// const select_query = selectSingleTrade(original.tradeId);
	const saved_2 = (
		await db.execute(select_query.queryString, select_query.params)
	).rows[0] as Trade;

	expect(saved_2).toEqual({ ...original, id: saved_1.id });
});
