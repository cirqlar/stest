import { Migration } from './types';

const add_trades_table: Migration = {
	name: '0004_add_trades_table',
	query: `
		CREATE TABLE IF NOT EXISTS trades (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			tradeId TEXT UNIQUE,
			marketId TEXT,
			price DOUBLE,
			size DOUBLE,
			side TEXT,
			timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
		)
	`,
};

export default add_trades_table;
