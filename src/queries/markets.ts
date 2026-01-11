import { useQuery, useQueryClient } from '@tanstack/react-query';

import useDB from '../stores/db';
import { Market, OrderBookItem, Trade } from '../db/types';

export function useMarkets() {
	const db = useDB(s => s.db);
	let res = useQuery({
		queryKey: ['markets'],
		queryFn: async () =>
			(await db.execute('SELECT * FROM markets')).rows as Market[],
	});

	return res;
}

export function useMarket(marketId: string) {
	const db = useDB(s => s.db);
	const queryClient = useQueryClient();

	let res = useQuery({
		queryKey: ['markets', marketId],
		queryFn: async () =>
			(
				await db.execute('SELECT * FROM markets WHERE marketId = ?', [
					marketId,
				])
			).rows[0] as Market,
		initialData: () => {
			const marketData: Market[] | undefined = queryClient.getQueryData([
				'markets',
			]);
			return marketData?.find(m => m.marketId === marketId);
		},
		initialDataUpdatedAt: () => {
			return queryClient.getQueryState(['markets'])?.dataUpdatedAt;
		},
	});

	return res;
}

export function useTopBids(marketId: string, count: number) {
	const db = useDB(s => s.db);

	const res = useQuery({
		queryKey: ['bids', marketId, count],
		queryFn: async () => {
			return (
				await db.execute(
					`SELECT * FROM bids
						WHERE marketId = ?
					ORDER BY price DESC
					LIMIT ?`,
					[marketId, count],
				)
			).rows as OrderBookItem[];
		},
	});

	return res;
}

export function useTopAsks(marketId: string, count: number) {
	const db = useDB(s => s.db);

	const res = useQuery({
		queryKey: ['asks', marketId, count],
		queryFn: async () => {
			return (
				await db.execute(
					`SELECT * FROM asks
						WHERE marketId = ?
					ORDER BY price ASC
					LIMIT ?`,
					[marketId, count],
				)
			).rows as OrderBookItem[];
		},
	});

	return res;
}

export function useRecentTrades(marketId: string, count: number) {
	const db = useDB(s => s.db);

	const res = useQuery({
		queryKey: ['trades', marketId, count],
		queryFn: async () => {
			return (
				await db.execute(
					`SELECT * FROM trades
						WHERE marketId = ?
					ORDER BY timestamp DESC
					LIMIT ?`,
					[marketId, count],
				)
			).rows as Trade[];
		},
	});

	return res;
}
