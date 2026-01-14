import { MARKETS_TABLE } from '../tables';
import { DBQuery } from '../types';

export function selectAllMarkets(): DBQuery {
	return { queryString: `SELECT * FROM ${MARKETS_TABLE}` };
}

export function selectSingleMarket(marketId: string): DBQuery {
	return {
		queryString: `SELECT * FROM ${MARKETS_TABLE} WHERE marketId = ?`,
		params: [marketId],
	};
}
