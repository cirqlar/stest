import { useEffect, useEffectEvent } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';

import useReplayEngine from '@/stores/replayEngine';

export default function ReplayEngine() {
	const queryClient = useQueryClient();

	const state = useReplayEngine(s => s.status);
	const processed = useReplayEngine(s => s.processed);
	const start_playback = useReplayEngine(s => s.start_playback);
	const pause_playback = useReplayEngine(s => s.pause_playback);
	const reset_playback = useReplayEngine(s => s.reset_playback);
	const set_query_client = useReplayEngine(s => s.set_query_client);
	const update_processed_internal = useReplayEngine(s => s.update_processed);
	const update_processed = useEffectEvent(update_processed_internal);

	useEffect(() => {
		set_query_client(queryClient);
	}, [queryClient, set_query_client]);

	useEffect(() => {
		const fn = async () => {
			const p = await AsyncStorage.getItem('processed_updates');
			if (p && !isNaN(Number(p))) {
				update_processed(Number(p));
			}
		};

		fn();
	}, []);

	useEffect(() => {
		AsyncStorage.setItem('processed_updates', processed.toString());
	}, [processed]);

	return (
		<View style={styles.replay_container}>
			<View>
				<Text style={styles.replay_text}>{state}</Text>
			</View>
			<Pressable
				disabled={state === 'finished' || state === 'resetting'}
				onPress={() => {
					if (state === 'paused') {
						start_playback();
					} else {
						pause_playback();
					}
				}}
			>
				<Text
					style={[
						styles.replay_text,
						state === 'finished' || state === 'resetting'
							? styles.replay_link_clickable_disabled
							: styles.replay_link_clickable,
					]}
				>
					{state === 'playing' ? 'Pause' : 'Play'}
				</Text>
			</Pressable>
			<Pressable
				disabled={state === 'resetting'}
				onPress={() => {
					reset_playback();
				}}
			>
				<Text
					style={[
						styles.replay_text,
						state === 'resetting'
							? styles.replay_link_clickable_disabled
							: styles.replay_link_clickable,
					]}
				>
					Reset
				</Text>
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	replay_container: {
		position: 'absolute',
		top: 100,
		right: 20,

		flexDirection: 'row',

		elevation: 5,
		shadowColor: '#000',

		backgroundColor: 'white',
		padding: 20,
		borderRadius: 8,
		gap: 8,
	},

	replay_text: {
		fontSize: 16,
		textTransform: 'capitalize',
	},
	replay_link_clickable: {
		color: 'blue',
	},
	replay_link_clickable_disabled: {
		color: 'grey',
	},
});
