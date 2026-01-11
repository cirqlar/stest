import { Migration } from './types';

const add_assets_table: Migration = {
	name: '0001_add_assets_table',
	query: [
		[
			`CREATE TABLE IF NOT EXISTS assets (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				assetId TEXT UNIQUE NOT NULL,
				decimals INTEGER NOT NULL,
				description TEXT NOT NULL,
			)`,
		],
	],
};

export default add_assets_table;
