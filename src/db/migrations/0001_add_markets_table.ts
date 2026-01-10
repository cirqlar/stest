import { Migration } from './types';

const add_markets_table: Migration = {
	name: '0001_add_markets_table',
	query: `
		CREATE TABLE IF NOT EXISTS markets (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			marketId TEXT UNIQUE,
			base TEXT,
			quote TEXT,
			tickSize DOUBLE,
			minOrderSize DOUBLE,
			initialLastPrice DOUBLE,
			initialChange24h DOUBLE,
		)
	`,
};

export default add_markets_table;
