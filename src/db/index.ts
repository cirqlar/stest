import { open } from '@op-engineering/op-sqlite';

export const db_name = 'stest_test_01';

export const db = open({
	name: `${db_name}.sqlite`,
});
