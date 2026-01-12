import { Migration } from '../types';

const add_markets_table: Migration = {
	name: '0002_add_markets_table',
	query: [
		[
			`CREATE TABLE IF NOT EXISTS markets (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				marketId TEXT UNIQUE NOT NULL,
				base TEXT NOT NULL,
				quote TEXT NOT NULL,
				tickSize DOUBLE NOT NULL,
				minOrderSize DOUBLE NOT NULL,
				lastPrice DOUBLE NOT NULL,
				change24h DOUBLE NOT NULL
			)`,
		],
	],
};

export default add_markets_table;
