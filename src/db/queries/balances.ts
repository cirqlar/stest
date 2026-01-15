import { ASSETS_TABLE, BALANCES_TABLE } from '@/db/tables';
import { DBQuery } from '@/db/types';

export function selectAllBalances(): DBQuery {
	return {
		queryString: `
			SELECT b.assetId AS assetId, available, locked, decimals, description FROM ${BALANCES_TABLE} AS b
			JOIN ${ASSETS_TABLE} AS a
				ON b.assetId = a.assetId
		`,
	};
}

export function selectSingleBalance(assetId: string): DBQuery {
	return {
		queryString: `
			SELECT b.assetId AS assetId, available, locked, decimals, description FROM ${BALANCES_TABLE} AS b
			JOIN ${ASSETS_TABLE} AS a
				ON b.assetId = a.assetId
				WHERE b.assetId = ?
		`,
		params: [assetId],
	};
}

export function updateBalance(
	assetId: string,
	available: number,
	locked: number,
): DBQuery {
	return {
		queryString: `
			UPDATE ${BALANCES_TABLE}
				SET available = ?, locked = ?
				WHERE assetId = ?
		`,
		params: [available, locked, assetId],
	};
}
