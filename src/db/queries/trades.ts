import { TRADES_TABLE } from '@/db/tables';
import { DBQuery, Trade } from '@/db/types';

export function selectRecentTrades(marketId: string, count: number): DBQuery {
	return {
		queryString: `
			SELECT * FROM ${TRADES_TABLE}
				WHERE marketId = ?
			ORDER BY timestamp DESC
			LIMIT ?
		`,
		params: [marketId, count],
	};
}

export function selectSingleTrade(tradeId: string): DBQuery {
	return {
		queryString: `
			SELECT * FROM ${TRADES_TABLE}
				WHERE tradeId = ?
		`,
		params: [tradeId],
	};
}

export function insertOrIgnoreTrade(trade: Omit<Trade, 'id'>): DBQuery {
	return {
		queryString: `
			INSERT INTO ${TRADES_TABLE} (tradeId, marketId, price, size, side, timestamp)
				VALUES (?, ?, ?, ?, ?, ?)
			ON CONFLICT DO NOTHING
		`,
		params: [
			trade.tradeId,
			trade.marketId,
			trade.price,
			trade.size,
			trade.side,
			trade.timestamp,
		],
	};
}
