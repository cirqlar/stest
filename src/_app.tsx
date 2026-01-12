import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';

import useDB from './stores/db';
import { Navigation } from './routes';
import queryClient from './queries';
import useAssets from './stores/assets';
import ReplayEngine from './components/replay';

function App() {
	const initialize_db = useDB(s => s.initialize);
	const load_assets = useAssets(a => a.loadAssets);

	const db_state = useDB(s => s.state);

	useEffect(() => {
		initialize_db().catch(e => console.log('An error in my soup', e));
	}, [initialize_db]);

	useEffect(() => {
		if (db_state === 'initialized') {
			load_assets().catch(e => console.log('An error in my broth', e));
		}
	}, [db_state, load_assets]);

	return (
		<QueryClientProvider client={queryClient}>
			<Navigation />
			<ReplayEngine />
		</QueryClientProvider>
	);
}

export default App;
