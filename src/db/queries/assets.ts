import { ASSETS_TABLE } from '@/db/tables';
import { DBQuery } from '@/db/types';

export function selectAllAssets(): DBQuery {
	return {
		queryString: `SELECT * FROM ${ASSETS_TABLE}`,
	};
}
