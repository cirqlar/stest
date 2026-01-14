import { Scalar } from '@op-engineering/op-sqlite';

import { Migration } from '@/db/types';
import usdt_trades from '@/provided/seed/trades/USDT-NGN.json';
import usdc_trades from '@/provided/seed/trades/USDC-NGN.json';

const seed_trades: Migration = {
	name: '0103_seed_trades',
	query: () => {
		let values: Scalar[][] = [];

		for (let i = 0; i < usdt_trades.length; i++) {
			const trade = usdt_trades[i];
			values.push([
				trade.tradeId,
				trade.market,
				trade.price,
				trade.size,
				trade.side,
				trade.ts,
			]);
		}

		for (let i = 0; i < usdc_trades.length; i++) {
			const trade = usdc_trades[i];
			values.push([
				trade.tradeId,
				trade.market,
				trade.price,
				trade.size,
				trade.side,
				trade.ts,
			]);
		}

		return [
			[
				`INSERT INTO trades (tradeId, marketId, price, size, side, timestamp)
					VALUES (?, ?, ?, ?, ?, ?)`,
				values,
			],
		];
	},
};

export default seed_trades;
