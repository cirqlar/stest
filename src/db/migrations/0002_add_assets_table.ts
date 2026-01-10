import { Migration } from './types';

const add_assets_table: Migration = {
	name: '0002_add_assets_table',
	query: `
		CREATE TABLE IF NOT EXISTS assets (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			assetId TEXT UNIQUE,
			decimals INTEGER,
			description TEXT,
		)
	`,
};

export default add_assets_table;
