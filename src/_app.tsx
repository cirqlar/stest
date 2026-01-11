import { useEffect, useEffectEvent } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';

import useDB from './stores/db';
import { Navigation } from './routes';
import queryClient from './queries';

function App() {
	const initialize_db = useDB(s => s.initialize);
	const initialize_db_event = useEffectEvent(initialize_db);

	useEffect(() => {
		initialize_db_event().catch(e => console.log('An error in my soup', e));
	}, []);

	return (
		<QueryClientProvider client={queryClient}>
			<Navigation />
		</QueryClientProvider>
	);
}

export default App;
