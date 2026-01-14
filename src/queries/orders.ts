import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SQLBatchTuple } from '@op-engineering/op-sqlite';

import useDB from '../stores/db';
import { Market, Order } from '../db/types';
import { QueryWallet } from './wallet';
import {
	insertOrder,
	selectOrderCount,
	selectOrdersWithOffset,
	selectSingleOrder,
	updateOrderStatus,
} from '../db/queries/orders';
import { selectAllBalances, updateBalance } from '../db/queries/balances';

export type Pagination = { count: number; page: number };

export function useOrders(pagination: Pagination = { count: 10, page: 1 }) {
	const db = useDB(s => s.db);

	const res = useQuery({
		queryKey: ['orders', pagination],
		queryFn: async () => {
			const order_count_query = selectOrderCount();
			let order_count = (
				await db.execute(
					order_count_query.queryString,
					order_count_query.params,
				)
			).rows[0].count as number;

			if (order_count === 0) {
				return { orders: [], page_count: 1 };
			}

			let page_count = Math.ceil(order_count / pagination.count);

			if (pagination.page < 1 || page_count < pagination.page) {
				throw 'Page out of range';
			}

			const orders_query = selectOrdersWithOffset(
				pagination.count,
				pagination.count * (pagination.page - 1),
			);
			let orders = (
				await db.execute(orders_query.queryString, orders_query.params)
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

			const balances_query = selectAllBalances();
			let balances = (
				await db.execute(
					balances_query.queryString,
					balances_query.params,
				)
			).rows as QueryWallet[];

			const insert_order_query = insertOrder({
				marketId: order.marketId!,
				side: order.side!,
				price: order.price!,
				size: order.size!,
				status: 'pending',
			});
			let commands: SQLBatchTuple[] = [
				[insert_order_query.queryString, insert_order_query.params!],
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

				const updated_balance_query = updateBalance(
					base_balance.assetId,
					base_balance.available - order.size!,
					base_balance.locked + order.size!,
				);
				commands.push([
					updated_balance_query.queryString,
					updated_balance_query.params!,
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

				const updated_balance_query = updateBalance(
					quote_balance.assetId,
					quote_balance.available - quote_amount,
					quote_balance.locked + quote_amount,
				);
				commands.push([
					updated_balance_query.queryString,
					updated_balance_query.params!,
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
			const order_query = selectSingleOrder(orderId);
			let order = (
				await db.execute(order_query.queryString, order_query.params)
			).rows?.[0] as Order;

			if (!order) {
				throw new Error("Couldn't find order");
			}

			if (order.status === 'cancelled') {
				console.log('order already cancelled');
				return;
			}

			const balances_query = selectAllBalances();
			let balances = (
				await db.execute(
					balances_query.queryString,
					balances_query.params,
				)
			).rows as QueryWallet[];

			if (!balances) {
				throw new Error("Couldn't get wallet balances");
			}

			const update_order_query = updateOrderStatus(orderId, 'cancelled');
			let commands: SQLBatchTuple[] = [
				[update_order_query.queryString, update_order_query.params!],
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

				const update_balance_query = updateBalance(
					base_balance.assetId,
					base_balance.available + order.size!,
					base_balance.locked - order.size!,
				);
				commands.push([
					update_balance_query.queryString,
					update_balance_query.params!,
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

				const update_balance_query = updateBalance(
					quote_balance.assetId,
					quote_balance.available + quote_amount,
					quote_balance.locked - quote_amount,
				);
				commands.push([
					update_balance_query.queryString,
					update_balance_query.params!,
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
