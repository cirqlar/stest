import { open } from '@op-engineering/op-sqlite';

export const db = open({
	name: 'stest_test_03.sqlite',
});
