import { Migration } from './types';

const add_asks_table: Migration = {
	name: '0006_add_asks_table',
	query: `
		CREATE TABLE IF NOT EXISTS asks (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			marketId TEXT,
			price DOUBLE,
			size DOUBLE,
		)
	`,
};

export default add_asks_table;
