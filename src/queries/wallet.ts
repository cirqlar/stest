import { useQuery, useQueryClient } from '@tanstack/react-query';
import useDB from '../stores/db';
import { Asset, Wallet } from '../db/types';
import { ASSETS_TABLE, BALANCES_TABLE } from '../db/tables';

export type QueryWallet = Wallet & Asset;

export function useWalletsQuery() {
	const db = useDB(s => s.db);

	const res = useQuery({
		queryKey: ['balances'],
		queryFn: async () => {
			return (
				await db.execute(
					`SELECT b.assetId AS assetId, available, locked, decimals, description FROM ${BALANCES_TABLE} AS b
					JOIN ${ASSETS_TABLE} AS a
						ON b.assetId = a.assetId`,
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
			return (
				await db.execute(
					`SELECT b.assetId AS assetId, available, locked, decimals, description FROM ${BALANCES_TABLE} AS b
						WHERE b.assetId = ?
					JOIN ${ASSETS_TABLE} AS a
						ON b.assetId = a.assetId`,
					[assetId],
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
