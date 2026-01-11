import { SQLBatchTuple } from '@op-engineering/op-sqlite';

export type Migration = {
	name: string;
	query: SQLBatchTuple[] | (() => SQLBatchTuple[]);
};
