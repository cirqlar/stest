import { ASSETS_TABLE } from '../tables';
import { DBQuery } from '../types';

export function selectAllAssets(): DBQuery {
	return {
		queryString: `SELECT * FROM ${ASSETS_TABLE}`,
	};
}
