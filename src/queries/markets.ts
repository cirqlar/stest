import { queryOptions, useQuery, useQueryClient } from '@tanstack/react-query';

import useDB from '../stores/db';
import { Market, OrderBookItem, Trade } from '../db/types';
import { useMemo } from 'react';

export function useMarkets() {
	const db = useDB(s => s.db);
	let query = useQuery({
		queryKey: ['markets'],
		queryFn: async () =>
			(await db.execute('SELECT * FROM markets')).rows as Market[],
	});

	return query;
}

export function useMarket(marketId: string) {
	const db = useDB(s => s.db);
	const queryClient = useQueryClient();

	let query = useQuery({
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

	return query;
}

export function useTopBidsOptions(marketId: string, count: number) {
	const db = useDB(s => s.db);

	const options = useMemo(
		() =>
			queryOptions({
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
				placeholderData: (prevData, prevQuery) =>
					prevQuery?.queryKey[1] === marketId ? prevData : undefined,
			}),
		[db, marketId, count],
	);

	return options;
}

export function useTopBids(marketId: string, count: number) {
	const options = useTopBidsOptions(marketId, count);

	const query = useQuery(options);

	return query;
}

export function useTopAsksOptions(marketId: string, count: number) {
	const db = useDB(s => s.db);

	const options = useMemo(
		() =>
			queryOptions({
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
				placeholderData: (prevData, prevQuery) =>
					prevQuery?.queryKey[1] === marketId ? prevData : undefined,
			}),
		[db, marketId, count],
	);

	return options;
}

export function useTopAsks(marketId: string, count: number) {
	const options = useTopAsksOptions(marketId, count);

	const query = useQuery(options);

	return query;
}

export function useRecentTradesOptions(marketId: string, count: number) {
	const db = useDB(s => s.db);

	const options = useMemo(
		() =>
			queryOptions({
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
			}),
		[db, marketId, count],
	);

	return options;
}

export function useRecentTrades(marketId: string, count: number) {
	const options = useRecentTradesOptions(marketId, count);

	const query = useQuery(options);

	return query;
}
