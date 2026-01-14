import { ASKS_TABLE, BIDS_TABLE } from '@/db/tables';
import { DBQuery, OrderBookItem } from '@/db/types';

type BASide = 'bid' | 'ask';

export function selectTopOrderbookItems(
	side: BASide,
	marketId: string,
	count: number,
): DBQuery {
	return {
		queryString: `
			SELECT * FROM ${side === 'bid' ? BIDS_TABLE : ASKS_TABLE}
				WHERE marketId = ?
			ORDER BY price DESC
			LIMIT ?
		`,
		params: [marketId, count],
	};
}

export function selectOrderbookItem(
	side: BASide,
	marketId: string,
	price: number,
) {
	return {
		queryString: `
			SELECT * FROM ${side === 'bid' ? BIDS_TABLE : ASKS_TABLE}
				WHERE marketId = ? AND price = ?
		`,
		params: [marketId, price],
	};
}

export function insertOrderbookItem(
	side: BASide,
	item: Omit<OrderBookItem, 'id'>,
): DBQuery {
	return {
		queryString: `
			INSERT INTO ${side === 'bid' ? BIDS_TABLE : ASKS_TABLE} (marketId, price, size)
				VALUES (?, ?, ?)
		`,
		params: [item.marketId, item.price, item.size],
	};
}

export function updateOrderbookItemSize(
	side: BASide,
	marketId: string,
	price: number,
	size: number,
): DBQuery {
	return {
		queryString: `
			UPDATE ${side === 'bid' ? BIDS_TABLE : ASKS_TABLE} 
				SET size = ?
				WHERE marketId = ? AND price = ?
		`,
		params: [size, marketId, price],
	};
}

export function insertOrUpdateOrderbookItem(
	side: BASide,
	item: Omit<OrderBookItem, 'id'>,
): DBQuery {
	return {
		queryString: `
			INSERT INTO ${side === 'bid' ? BIDS_TABLE : ASKS_TABLE} (marketId, price, size)
				VALUES (?, ?, ?)
			ON CONFLICT DO UPDATE 
				SET size = excluded.size
		`,
		params: [item.marketId, item.price, item.size],
	};
}

export function deleteOrderbookItem(side: BASide, price: number): DBQuery {
	return {
		queryString: `DELETE FROM ${
			side === 'bid' ? BIDS_TABLE : ASKS_TABLE
		} WHERE price = ?`,
		params: [price],
	};
}
