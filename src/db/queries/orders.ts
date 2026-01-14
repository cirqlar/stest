import { MARKETS_TABLE, ORDERS_TABLE } from '../tables';
import { DBQuery, Order } from '../types';

export function selectOrderCount(): DBQuery {
	return {
		queryString: `SELECT COUNT(*) as count FROM ${ORDERS_TABLE}`,
	};
}

export function selectOrdersWithOffset(count: number, offset: number): DBQuery {
	return {
		queryString: `
			SELECT 
				o.id as id, o.marketId as marketId, side, price, size, status, created_at, last_updated,
				base, quote, tickSize, minOrderSize
			FROM ${ORDERS_TABLE} AS o
			JOIN ${MARKETS_TABLE} AS m
				ON o.marketId = m.marketId
			ORDER BY created_at DESC
			LIMIT ? OFFSET ?
		`,
		params: [count, offset],
	};
}

export function selectSingleOrder(orderId: number): DBQuery {
	return {
		queryString: `
			SELECT 
				o.id as id, o.marketId as marketId, side, price, size, status, created_at, last_updated,
				base, quote, tickSize, minOrderSize
			FROM ${ORDERS_TABLE} AS o
			JOIN ${MARKETS_TABLE} AS m
				ON o.marketId = m.marketId
				WHERE o.id = ?
		`,
		params: [orderId],
	};
}

export function insertOrder(
	order: Pick<Order, 'marketId' | 'side' | 'price' | 'size' | 'status'>,
): DBQuery {
	return {
		queryString: `
			INSERT INTO ${ORDERS_TABLE} (marketId, side, price, size, status)
				VALUES (?, ?, ?, ?, ?)
		`,
		params: [
			order.marketId,
			order.side,
			order.price,
			order.size,
			order.status,
		],
	};
}

export function updateOrderStatus(
	orderId: number,
	new_status: Order['status'],
): DBQuery {
	return {
		queryString: `
			UPDATE ${ORDERS_TABLE}
				SET status = ?, last_updated = CURRENT_TIMESTAMP
				WHERE id = ?
		`,
		params: [new_status, orderId],
	};
}
