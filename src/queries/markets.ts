import { useMemo } from 'react';
import { queryOptions, useQuery, useQueryClient } from '@tanstack/react-query';

import useDB from '@/stores/db';
import { Market, OrderBookItem, Trade } from '@/db/types';
import { selectRecentTrades } from '@/db/queries/trades';
import { selectTopOrderbookItems } from '@/db/queries/orderbook_item';
import { selectAllMarkets, selectSingleMarket } from '@/db/queries/markets';

export function useMarkets() {
	const db = useDB(s => s.db);
	let query = useQuery({
		queryKey: ['markets'],
		queryFn: async () => {
			const db_query = selectAllMarkets();

			return (await db.execute(db_query.queryString, db_query.params))
				.rows as Market[];
		},
	});

	return query;
}

export function useMarket(marketId: string) {
	const db = useDB(s => s.db);
	const queryClient = useQueryClient();

	let query = useQuery({
		queryKey: ['markets', marketId],
		queryFn: async () => {
			const db_query = selectSingleMarket(marketId);

			return (await db.execute(db_query.queryString, db_query.params))
				.rows[0] as Market;
		},
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
					const db_query = selectTopOrderbookItems(
						'bid',
						marketId,
						count,
					);

					return (
						await db.execute(db_query.queryString, db_query.params)
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
					const db_query = selectTopOrderbookItems(
						'ask',
						marketId,
						count,
					);

					return (
						await db.execute(db_query.queryString, db_query.params)
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
					const db_query = selectRecentTrades(marketId, count);

					return (
						await db.execute(db_query.queryString, db_query.params)
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
