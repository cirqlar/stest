import { useQuery } from '@tanstack/react-query';
import useDB from '../stores/db';
import { Order } from '../db/types';

export type Pagination = { count: number; page: number };

export function useOrders(pagination: Pagination = { count: 10, page: 1 }) {
	const db = useDB(s => s.db);

	const res = useQuery({
		queryKey: ['orders', pagination],
		queryFn: async () => {
			let order_count = (
				await db.execute(`SELECT COUNT(*) as count FROM orders`)
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
					`SELECT * FROM orders
							WHERE last_updated > ?
						ORDER BY last_updated DESC
						LIMIT ? OFFSET ?`,
					[
						pagination.count,
						pagination.count * (pagination.page - 1),
					],
				)
			).rows as Order[];

			return { orders, page_count };
		},
	});

	return res;
}
