import { TRADES_TABLE } from '@/db/tables';
import { Migration } from '@/db/types';

const add_trades_table: Migration = {
	name: '0004_add_trades_table',
	query: [
		[
			`CREATE TABLE IF NOT EXISTS ${TRADES_TABLE} (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				tradeId TEXT UNIQUE NOT NULL,
				marketId TEXT NOT NULL,
				price DOUBLE NOT NULL,
				size DOUBLE NOT NULL,
				side TEXT NOT NULL,
				timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
			)`,
		],
		[
			`CREATE INDEX IF NOT EXISTS trades_tradeId_idx ON ${TRADES_TABLE} (tradeId)`,
		],
		[
			`CREATE INDEX IF NOT EXISTS trades_timestamp_idx ON ${TRADES_TABLE} (timestamp)`,
		],
		[
			`CREATE INDEX IF NOT EXISTS trades_marketId_timestamp_idx ON ${TRADES_TABLE} (marketId, timestamp)`,
		],
	],
};

export default add_trades_table;
