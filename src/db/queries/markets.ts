import { MARKETS_TABLE } from '@/db/tables';
import { DBQuery } from '@/db/types';

export function selectAllMarkets(): DBQuery {
	return { queryString: `SELECT * FROM ${MARKETS_TABLE}` };
}

export function selectSingleMarket(marketId: string): DBQuery {
	return {
		queryString: `SELECT * FROM ${MARKETS_TABLE} WHERE marketId = ?`,
		params: [marketId],
	};
}
