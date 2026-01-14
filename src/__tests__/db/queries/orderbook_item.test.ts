import { db } from '@/db';
import {
	insertOrderbookItem,
	insertOrUpdateOrderbookItem,
	selectOrderbookItem,
} from '@/db/queries/orderbook_item';
import { OrderBookItem } from '@/db/types';

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

test('inserting a bid with a price that already exists updates the existing bid', async () => {
	const original = {
		marketId: 'market',
		price: 1734,
		size: 300,
	};

	const insert_query = insertOrderbookItem('bid', original);
	await db.execute(insert_query.queryString, insert_query.params);

	const select_query = selectOrderbookItem(
		'bid',
		original.marketId,
		original.price,
	);
	let first = (
		await db.execute(select_query.queryString, select_query.params)
	).rows[0] as OrderBookItem;

	const insert_or_update_query = insertOrUpdateOrderbookItem('bid', {
		marketId: original.marketId,
		price: original.price,
		size: 900,
	});
	await db.execute(
		insert_or_update_query.queryString,
		insert_or_update_query.params,
	);

	let second = (
		await db.execute(select_query.queryString, select_query.params)
	).rows[0] as OrderBookItem;

	expect(second.id).toEqual(first.id);
});
