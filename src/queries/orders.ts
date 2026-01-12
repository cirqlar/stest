import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useDB from '../stores/db';
import { Market, Order } from '../db/types';
import { SQLBatchTuple } from '@op-engineering/op-sqlite';
import { QueryWallet } from './wallet';
import {
	ASSETS_TABLE,
	BALANCES_TABLE,
	MARKETS_TABLE,
	ORDERS_TABLE,
} from '../db/tables';

export type Pagination = { count: number; page: number };

export function useOrders(pagination: Pagination = { count: 10, page: 1 }) {
	const db = useDB(s => s.db);

	const res = useQuery({
		queryKey: ['orders', pagination],
		queryFn: async () => {
			let order_count = (
				await db.execute(
					`SELECT COUNT(*) as count FROM ${ORDERS_TABLE}`,
				)
			).rows[0].count as number;

			if (order_count === 0) {
				return { orders: [], page_count: 1 };
			}

			let page_count = Math.ceil(order_count / pagination.count);

			if (pagination.page < 1 || page_count < pagination.page) {
				throw 'Page out of range';
			}

			let orders = (
				await db.execute(
					`SELECT 
						o.id as id, o.marketId as marketId, side, price, size, status, created_at, last_updated,
						base, quote, tickSize, minOrderSize
					FROM ${ORDERS_TABLE} AS o
					JOIN ${MARKETS_TABLE} AS m
						ON o.marketId = m.marketId
					ORDER BY created_at DESC
					LIMIT ? OFFSET ?`,
					[
						pagination.count,
						pagination.count * (pagination.page - 1),
					],
				)
			).rows as Order[];

			return { orders, page_count };
		},
		placeholderData: prev => prev,
	});

	return res;
}

export function useNewOrderMutation() {
	const db = useDB(s => s.db);
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: async ({
			order,
			market,
		}: {
			order: Partial<Order>;
			market: Market;
		}) => {
			if (
				!('marketId' in order) ||
				!('side' in order) ||
				!('price' in order) ||
				!('size' in order)
			) {
				throw new Error('Not enough information to place order');
			}

			let balances = (
				await db.execute(
					`SELECT b.assetId AS assetId, available, locked, decimals, description FROM ${BALANCES_TABLE} AS b
								JOIN ${ASSETS_TABLE} AS a
									ON b.assetId = a.assetId`,
				)
			).rows as QueryWallet[];

			let commands: SQLBatchTuple[] = [
				[
					`INSERT INTO ${ORDERS_TABLE} (marketId, side, price, size, status)
						VALUES (?, ?, ?, ?, ?)`,
					[
						order.marketId!,
						order.side!,
						order.price!,
						order.size!,
						'pending',
					],
				],
			];

			if (order.side === 'sell') {
				const base_balance = balances.find(
					b => b.assetId === market.base,
				);

				if (!base_balance) {
					throw new Error('Missing balance');
				}

				if (base_balance.available < order.size!) {
					throw new Error('Insufficient funds');
				}

				commands.push([
					`UPDATE ${BALANCES_TABLE}
						SET available = ?, locked = ?
						WHERE assetId = ?`,
					[
						base_balance.available - order.size!,
						base_balance.locked + order.size!,
						base_balance.assetId,
					],
				]);
			} else {
				const quote_balance = balances.find(
					b => b.assetId === market.quote,
				);
				const quote_amount = order.size! * order.price!;

				if (!quote_balance) {
					throw new Error('Missing balance');
				}

				if (quote_balance.available < quote_amount) {
					throw new Error('Insufficient funds');
				}

				commands.push([
					`UPDATE ${BALANCES_TABLE}
						SET available = ?, locked = ?
						WHERE assetId = ?`,
					[
						quote_balance.available - quote_amount,
						quote_balance.locked + quote_amount,
						quote_balance.assetId,
					],
				]);
			}

			await db.executeBatch(commands);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['balances'] });
			queryClient.invalidateQueries({ queryKey: ['orders'] });
		},
	});

	return mutation;
}

export function useCancelOrderMutation() {
	const db = useDB(s => s.db);
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: async (orderId: number) => {
			let order = (
				await db.execute(
					`SELECT 
						o.id as id, o.marketId as marketId, side, price, size, status, created_at, last_updated,
						base, quote, tickSize, minOrderSize
					FROM ${ORDERS_TABLE} AS o
					JOIN ${MARKETS_TABLE} AS m
						ON o.marketId = m.marketId
						WHERE o.id = ?`,
					[orderId],
				)
			).rows?.[0] as Order;

			if (!order) {
				throw new Error("Couldn't find order");
			}

			if (order.status === 'cancelled') {
				console.log('order already cancelled');
				return;
			}

			let balances = (
				await db.execute(
					`SELECT b.assetId AS assetId, available, locked, decimals, description FROM ${BALANCES_TABLE} AS b
						JOIN ${ASSETS_TABLE} AS a
							ON b.assetId = a.assetId`,
				)
			).rows as QueryWallet[];

			if (!balances) {
				throw new Error("Couldn't get wallet balances");
			}

			let commands: SQLBatchTuple[] = [
				[
					`UPDATE ${ORDERS_TABLE}
						SET status = ?, last_updated = CURRENT_TIMESTAMP
						WHERE id = ?`,
					['cancelled', orderId],
				],
			];

			if (order.side === 'sell') {
				const base_balance = balances.find(
					b => b.assetId === order.base,
				);

				if (!base_balance) {
					throw new Error('Missing balance');
				}

				if (base_balance?.locked < order.size) {
					throw new Error(
						'funds imbalance, not enough left to unlock',
					);
				}

				commands.push([
					`UPDATE ${BALANCES_TABLE}
						SET available = ?, locked = ?
						WHERE assetId = ?`,
					[
						base_balance.available + order.size!,
						base_balance.locked - order.size!,
						base_balance.assetId,
					],
				]);
			} else {
				const quote_balance = balances.find(
					b => b.assetId === order.quote,
				);
				const quote_amount = order.size * order.price;

				if (!quote_balance) {
					throw new Error('Missing balance');
				}

				if (quote_balance?.locked < quote_amount) {
					throw new Error(
						'funds imbalance, not enough left to unlock',
					);
				}

				commands.push([
					`UPDATE ${BALANCES_TABLE}
						SET available = ?, locked = ?
						WHERE assetId = ?`,
					[
						quote_balance.available + quote_amount,
						quote_balance.locked - quote_amount,
						quote_balance.assetId,
					],
				]);
			}

			await db.executeBatch(commands);
		},

		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['balances'] });
			queryClient.invalidateQueries({ queryKey: ['orders'] });
		},
	});

	return mutation;
}
