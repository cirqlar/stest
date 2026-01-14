import { Scalar } from '@op-engineering/op-sqlite';

import { Migration } from '@/db/types';
import usdt_orderbook from '@/provided/seed/orderbooks/USDT-NGN.json';
import usdc_orderbook from '@/provided/seed/orderbooks/USDC-NGN.json';

const seed_bids_asks: Migration = {
	name: '0104_seed_bids_asks',
	query: () => {
		let bids: Scalar[][] = [];

		for (let i = 0; i < usdt_orderbook.bids.length; i++) {
			const bid = usdt_orderbook.bids[i];
			bids.push([usdt_orderbook.market, bid[0], bid[1]]);
		}

		for (let i = 0; i < usdc_orderbook.bids.length; i++) {
			const bid = usdc_orderbook.bids[i];
			bids.push([usdc_orderbook.market, bid[0], bid[1]]);
		}

		let asks: Scalar[][] = [];

		for (let i = 0; i < usdt_orderbook.asks.length; i++) {
			const ask = usdt_orderbook.asks[i];
			asks.push([usdt_orderbook.market, ask[0], ask[1]]);
		}

		for (let i = 0; i < usdc_orderbook.asks.length; i++) {
			const ask = usdc_orderbook.asks[i];
			asks.push([usdc_orderbook.market, ask[0], ask[1]]);
		}

		return [
			[
				`INSERT INTO bids (marketId, price, size)
					VALUES (?, ?, ?)`,
				bids,
			],

			[
				`INSERT INTO asks (marketId, price, size)
					VALUES (?, ?, ?)`,
				asks,
			],
		];
	},
};

export default seed_bids_asks;
