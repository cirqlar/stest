import { Scalar } from '@op-engineering/op-sqlite';

import { Migration } from '../types';
import assets from '../../provided/seed/assets.json';

const seed_assets: Migration = {
	name: '0100_seed_assets',
	query: () => {
		let values: Scalar[][] = [];

		for (let i = 0; i < assets.length; i++) {
			const asset = assets[i];
			values.push([asset.assetId, asset.decimals, asset.description]);
		}

		return [
			[
				`INSERT INTO assets (assetId, decimals, description)
					VALUES (?, ?, ?)`,
				values,
			],
		];
	},
};

export default seed_assets;
