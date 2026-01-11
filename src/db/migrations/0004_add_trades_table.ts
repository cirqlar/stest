import { Migration } from '../types';

const add_trades_table: Migration = {
	name: '0004_add_trades_table',
	query: [
		[
			`CREATE TABLE IF NOT EXISTS trades (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				tradeId TEXT UNIQUE NOT NULL,
				marketId TEXT NOT NULL,
				price DOUBLE NOT NULL,
				size DOUBLE NOT NULL,
				side TEXT NOT NULL,
				timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
			)`,
		],
	],
};

export default add_trades_table;
