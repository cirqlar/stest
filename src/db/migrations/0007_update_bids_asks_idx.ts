import { ASKS_TABLE, BIDS_TABLE } from '../tables';
import { Migration } from '../types';

const update_bids_asks_idx: Migration = {
	name: '0007_update_bids_asks_idx',
	query: [
		// Delete old indexes
		[`DROP INDEX IF EXISTS bids_marketid_price_idx`],
		[`DROP INDEX IF EXISTS asks_marketId_price_idx`],

		// Add now indexes that are unique
		[
			`CREATE UNIQUE INDEX IF NOT EXISTS bids_marketid_price_idx ON ${BIDS_TABLE} (marketId, price)`,
		],
		[
			`CREATE UNIQUE INDEX IF NOT EXISTS asks_marketId_price_idx ON ${ASKS_TABLE} (marketId, price)`,
		],
	],
};

export default update_bids_asks_idx;
