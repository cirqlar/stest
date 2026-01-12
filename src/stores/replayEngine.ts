import { create } from 'zustand';

import content from '../provided/stream/market_stream.ndjson';
import { Side } from '../db/types';
import useDB from './db';
import { QueryClient } from '@tanstack/react-query';
import queryClient from '../queries';
import { ASKS_TABLE, BIDS_TABLE, TRADES_TABLE } from '../db/tables';

type Update =
	| {
			type: 'trade';
			market: string;
			tradeId: string;
			price: number;
			size: number;
			side: Side;
			ts: number;
			seq: number;
	  }
	| {
			type: 'ob_delta';
			market: string;
			side: 'ask' | 'bid';
			price: number;
			size: number;
			ts: number;
			seq: number;
	  };

const commands: Update[] = content
	.split('\n')
	.map(line => {
		const trimmed_line = line.trim();
		if (trimmed_line === '') {
			return undefined;
		} else {
			return JSON.parse(line.trim());
		}
	})
	.filter(comm => typeof comm !== 'undefined');

type ReplayEngineState = {
	count: number;
	processed: number;
	updates_per_second: number;
	status: 'paused' | 'playing' | 'finished' | 'resetting';
	playback_handle?: number;
	queryClient?: QueryClient;
	start_playback: () => void;
	pause_playback: (finished?: boolean) => void;
	run_next_update: () => void;
	reset_playback: () => Promise<void>;
	set_query_client: (client?: QueryClient) => void;
	update_processed: (n: number) => void;
};

const useReplayEngine = create<ReplayEngineState>()((set, get) => ({
	count: commands.length,
	processed: 0,
	updates_per_second: 60,
	status: 'paused',
	start_playback: () => {
		if (get().status !== 'paused') {
			return;
		}

		let handle = setInterval(
			get().run_next_update,
			1000 / get().updates_per_second,
		);

		set({ playback_handle: handle, status: 'playing' });
	},
	pause_playback: (finished = false) => {
		if (get().status !== 'playing') {
			return;
		}

		const playback_handle = get().playback_handle;

		if (playback_handle) {
			clearInterval(playback_handle);
			set({
				playback_handle: undefined,
				status: finished ? 'finished' : 'paused',
			});
		}
	},
	run_next_update: async () => {
		if (useDB.getState().state !== 'initialized') {
			console.log('DB is not initiallized');
			return;
		}
		const db = useDB.getState().db;

		const { processed: next_update, count, pause_playback, status } = get();

		if (status !== 'playing' && status !== 'paused') {
			console.log('Can not play in this state', status);
			return;
		}

		if (next_update >= count) {
			return pause_playback(true);
		}

		const update = commands[next_update];

		if (update.type === 'trade') {
			try {
				await db.execute(
					`INSERT INTO ${TRADES_TABLE} (tradeId, marketId, price, size, side, timestamp)
						VALUES (?, ?, ?, ?, ?, ?)`,
					[
						update.tradeId,
						update.market,
						update.price,
						update.size,
						update.side,
						update.ts,
					],
				);

				queryClient?.invalidateQueries({ queryKey: ['trades'] });
			} catch (e) {
				console.log(
					'Error applying update',
					update,
					'due to error',
					e,
					'skipping',
				);
			}
		} else {
			try {
				if (update.side === 'ask') {
					if (update.size === 0) {
						await db.execute(
							`DELETE FROM ${ASKS_TABLE} WHERE size = ?`,
							[update.size],
						);
					} else {
						await db.execute(
							`INSERT INTO ${ASKS_TABLE} (marketId, price, size)
								VALUES (?, ?, ?)`,
							[update.market, update.price, update.size],
						);
					}
					queryClient?.invalidateQueries({ queryKey: ['asks'] });
				} else {
					if (update.size === 0) {
						await db.execute(
							`DELETE FROM ${BIDS_TABLE} WHERE size = ?`,
							[update.size],
						);
					} else {
						await db.execute(
							`INSERT INTO ${BIDS_TABLE} (marketId, price, size)
								VALUES (?, ?, ?)`,
							[update.market, update.price, update.size],
						);
					}
					queryClient?.invalidateQueries({ queryKey: ['bids'] });
				}
			} catch (e) {
				console.log(
					'Error applying update',
					update,
					'due to error',
					e,
					'skipping',
				);
			}
		}

		set({ processed: next_update + 1 });

		if (next_update + 1 === count) {
			return pause_playback(true);
		}
	},
	reset_playback: async () => {
		if (get().status === 'playing') {
			get().pause_playback();
		}

		if (get().status !== 'paused' && get().status !== 'finished') {
			return;
		}

		set({ status: 'resetting' });
		try {
			await useDB.getState().reset_db();

			set({ status: 'paused', processed: 0 });
			queryClient?.resetQueries();
		} catch (e) {
			console.log('Error resetting db', e);
		}
	},
	set_query_client: client => set({ queryClient: client }),
	update_processed: n => {
		if (get().status === 'paused') {
			set({ processed: n });
		}
	},
}));

export default useReplayEngine;
