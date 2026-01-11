import { Scalar } from '@op-engineering/op-sqlite';

import { Migration } from '../types';
import balances from '../../provided/seed/balances.json';

const seed_balances: Migration = {
	name: '0102_seed_balances',
	query: () => {
		let values: Scalar[][] = [];

		for (let i = 0; i < balances.length; i++) {
			const balance = balances[i];
			values.push([balance.asset, balance.available, balance.locked]);
		}

		return [
			[
				`INSERT INTO balances (assetId, available, locked)
					VALUES (?, ?, ?)`,
				values,
			],
		];
	},
};

export default seed_balances;
