import { useEffect, useEffectEvent } from 'react';

import useDB from './stores/db';
import { Navigation } from './routes';

function App() {
	const initialize_db = useDB(s => s.initialize);
	const initialize_db_event = useEffectEvent(initialize_db);

	useEffect(() => {
		initialize_db_event();
	}, []);

	return <Navigation />;
}

export default App;
