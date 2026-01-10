import { Migration } from './types';

const add_bids_table: Migration = {
	name: '0005_add_bids_table',
	query: `
		CREATE TABLE IF NOT EXISTS bids (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			marketId TEXT,
			price DOUBLE,
			size DOUBLE,
		)
	`,
};

export default add_bids_table;
