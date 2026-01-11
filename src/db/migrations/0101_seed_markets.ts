import { Scalar } from '@op-engineering/op-sqlite';

import { Migration } from '../types';
import markets from '../../provided/seed/markets.json';

const seed_markets: Migration = {
	name: '0101_seed_markets',
	query: () => {
		let values: Scalar[][] = [];

		for (let i = 0; i < markets.length; i++) {
			const market = markets[i];
			values.push([
				market.marketId,
				market.base,
				market.quote,
				market.tickSize,
				market.minOrderSize,
				market.initialLastPrice,
				market.initialChange24h,
			]);
		}

		return [
			[
				`INSERT INTO markets (marketId, base, quote, tickSize, minOrderSize, initialLastPrice, initialChange24h)
					VALUES (?, ?, ?, ?, ?, ?, ?)`,
				values,
			],
		];
	},
};

export default seed_markets;
