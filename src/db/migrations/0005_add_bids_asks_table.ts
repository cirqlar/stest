import { ASKS_TABLE, BIDS_TABLE } from '../tables';
import { Migration } from '../types';

const add_bids_asks_table: Migration = {
	name: '0005_add_bids_asks_table',
	query: [
		[
			`CREATE TABLE IF NOT EXISTS ${BIDS_TABLE} (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				marketId TEXT NOT NULL,
				price DOUBLE NOT NULL,
				size DOUBLE NOT NULL
			)`,
		],
		[`CREATE INDEX IF NOT EXISTS bids_price_idx ON ${BIDS_TABLE} (price)`],
		[
			`CREATE INDEX IF NOT EXISTS bids_marketid_price_idx ON ${BIDS_TABLE} (marketId, price)`,
		],
		[
			`CREATE TABLE IF NOT EXISTS ${ASKS_TABLE} (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				marketId TEXT NOT NULL,
				price DOUBLE NOT NULL,
				size DOUBLE NOT NULL
			)`,
		],
		[`CREATE INDEX IF NOT EXISTS asks_price_idx ON ${ASKS_TABLE} (price)`],
		[
			`CREATE INDEX IF NOT EXISTS asks_marketId_price_idx ON ${ASKS_TABLE} (marketId, price)`,
		],
	],
};

export default add_bids_asks_table;
