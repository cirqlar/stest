import { create } from 'zustand';

import { Asset } from '../db/types';
import useDB from './db';

type AssetStoreState = {
	assets: Record<string, Asset>;
	loaded: boolean;
	loadAssets: () => Promise<void>;
};

const useAssets = create<AssetStoreState>()(set => ({
	assets: {},
	loaded: false,
	loadAssets: async () => {
		if (useDB.getState().state !== 'initialized') {
			return;
		}

		try {
			const assets_ret = (
				await useDB.getState().db.execute(`SELECT * FROM assets`)
			).rows as Asset[];

			let assets: AssetStoreState['assets'] = {};

			for (let asset of assets_ret) {
				assets[asset.assetId] = asset;
			}

			set({ assets, loaded: true });
		} catch (e) {
			console.log('Error retrieving assets', e);
		}
	},
}));

export default useAssets;
