import { Scalar, SQLBatchTuple } from '@op-engineering/op-sqlite';
import Database from 'better-sqlite3';

export class DB {
	db: ReturnType<typeof Database>;

	constructor() {
		this.db = new Database(':memory:');
	}

	async run(
		statement: ReturnType<ReturnType<typeof Database>['prepare']>,
		params?: Scalar[],
	) {
		return statement.reader
			? statement.all(params ?? [])
			: statement.run(params ?? []);
	}

	async execute(query: string, params?: Scalar[]) {
		const statement = this.db.prepare(query);

		return {
			rows: this.run(statement, params),
		};
	}

	async executeBatch(commands: SQLBatchTuple[]) {
		const exec = this.db.transaction(() => {
			for (const command of commands) {
				const statement = this.db.prepare(command[0]);

				// if we have commands and the commands are an object (aka, array)
				if (Array.isArray(command[1]) && Array.isArray(command[1][0])) {
					for (const single of command[1] as Scalar[][]) {
						this.run(statement, single);
					}
				} else {
					// Scalar[] or undefined

					this.run(statement, command[1] as Scalar[] | undefined);
				}
			}
		});

		exec();
	}
}

export const db = new DB();
