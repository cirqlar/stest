import { useQuery, useQueryClient } from '@tanstack/react-query';

import useDB from '@/stores/db';
import { Asset, Wallet } from '@/db/types';
import { selectAllBalances, selectSingleBalance } from '@/db/queries/balances';

export type QueryWallet = Wallet & Asset;

export function useWalletsQuery() {
	const db = useDB(s => s.db);

	const res = useQuery({
		queryKey: ['balances'],
		queryFn: async () => {
			const balances_query = selectAllBalances();

			return (
				await db.execute(
					balances_query.queryString,
					balances_query.params,
				)
			).rows as QueryWallet[];
		},
	});

	return res;
}

export function useWalletQuery(assetId: string) {
	const db = useDB(s => s.db);
	const queryClient = useQueryClient();

	const res = useQuery({
		queryKey: ['balances', assetId],
		queryFn: async () => {
			const select_wallet_query = selectSingleBalance(assetId);
			return (
				await db.execute(
					select_wallet_query.queryString,
					select_wallet_query.params,
				)
			).rows[0] as QueryWallet;
		},
		initialData: () => {
			let wallets: QueryWallet[] | undefined = queryClient.getQueryData([
				'balances',
			]);
			return wallets?.find(w => w.assetId === assetId);
		},
		initialDataUpdatedAt: () => {
			return queryClient.getQueryState(['balances'])?.dataUpdatedAt;
		},
	});

	return res;
}
