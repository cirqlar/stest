import { Migration } from '../types';

const add_orders_table: Migration = {
	name: '0006_add_orders_table',
	query: [
		[
			`CREATE TABLE IF NOT EXISTS orders (
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
	],
};

export default add_orders_table;
