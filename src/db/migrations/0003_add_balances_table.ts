import { BALANCES_TABLE } from '@/db/tables';
import { Migration } from '@/db/types';

const add_balances_table: Migration = {
	name: '0003_add_balances_table',
	query: [
		[
			`CREATE TABLE IF NOT EXISTS ${BALANCES_TABLE} (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				assetId TEXT UNIQUE NOT NULL,
				available DOUBLE NOT NULL,
				locked DOUBLE NOT NULL
			)`,
		],
	],
};

export default add_balances_table;
