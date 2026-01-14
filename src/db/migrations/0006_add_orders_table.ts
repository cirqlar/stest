import { ORDERS_TABLE } from '@/db/tables';
import { Migration } from '@/db/types';

const add_orders_table: Migration = {
	name: '0006_add_orders_table',
	query: [
		[
			`CREATE TABLE IF NOT EXISTS ${ORDERS_TABLE} (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				marketId TEXT NOT NULL,
				side TEXT NOT NULL,
				price DOUBLE NOT NULL,
				size DOUBLE NOT NULL,
				status TEXT NOT NULL,
				created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
				last_updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
			)`,
		],
		[
			`CREATE INDEX IF NOT EXISTS orders_created_at_idx ON ${ORDERS_TABLE} (created_at)`,
		],
	],
};

export default add_orders_table;
