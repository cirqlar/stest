import { Migration } from './types';

const add_bids_asks_table: Migration = {
	name: '0005_add_bids_asks_table',
	query: [
		[
			`CREATE TABLE IF NOT EXISTS bids (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				marketId TEXT NOT NULL,
				price DOUBLE NOT NULL,
				size DOUBLE NOT NULL,
			)`,
		],
		[
			`CREATE TABLE IF NOT EXISTS asks (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				marketId TEXT NOT NULL,
				price DOUBLE NOT NULL,
				size DOUBLE NOT NULL,
			)`,
		],
	],
};

export default add_bids_asks_table;
