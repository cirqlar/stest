import { Migration } from './types';

const add_balances_table: Migration = {
	name: '0003_add_balances_table',
	query: `
		CREATE TABLE IF NOT EXISTS balances (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			assetId TEXT UNIQUE,
			available DOUBLE,
			locked DOUBLE,
		)
	`,
};

export default add_balances_table;
