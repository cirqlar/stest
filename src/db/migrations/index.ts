import { Migration } from '@/db/types';

import add_assets_table from './0001_add_assets_table';
import add_markets_table from './0002_add_markets_table';
import add_balances_table from './0003_add_balances_table';
import add_trades_table from './0004_add_trades_table';
import add_bids_asks_table from './0005_add_bids_asks_table';
import add_orders_table from './0006_add_orders_table';
import update_bids_asks_idx from './0007_update_bids_asks_idx';
import seed_assets from './0100_seed_assets';
import seed_markets from './0101_seed_markets';
import seed_balances from './0102_seed_balances';
import seed_trades from './0103_seed_trades';
import seed_bids_asks from './0104_seed_bids_asks';

const migrations: Migration[] = [
	add_assets_table,
	add_markets_table,
	add_balances_table,
	add_trades_table,
	add_bids_asks_table,
	add_orders_table,
	update_bids_asks_idx,

	seed_assets,
	seed_markets,
	seed_balances,
	seed_trades,
	seed_bids_asks,
];

export default migrations;
