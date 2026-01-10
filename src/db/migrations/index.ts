import { Migration } from './types';

import add_markets_table from './0001_add_markets_table';
import add_assets_table from './0002_add_assets_table';
import add_balances_table from './0003_add_balances_table';
import add_trades_table from './0004_add_trades_table';
import add_bids_table from './0005_add_bids_table';
import add_asks_table from './0006_add_asks_table';

const migrations: Migration[] = [
	add_markets_table,
	add_assets_table,
	add_balances_table,
	add_trades_table,
	add_bids_table,
	add_asks_table,
];

export default migrations;
