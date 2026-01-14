import { create } from 'zustand';

import { Asset } from '@/db/types';
import useDB from '@/stores/db';
import { selectAllAssets } from '@/db/queries/assets';

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
			const assets_query = selectAllAssets();
			const assets_ret = (
				await useDB
					.getState()
					.db.execute(assets_query.queryString, assets_query.params)
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
