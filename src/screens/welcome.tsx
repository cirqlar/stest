import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import useDB from '@/stores/db';
import { AppNavigationProp } from '@/routes';

function WelcomeScreen() {
	const navigation = useNavigation<AppNavigationProp>();

	const db_state = useDB(s => s.state);
	const db_progress = useDB(s => s.initialization_progress);

	useEffect(() => {
		if (db_state === 'initialized') {
			navigation.replace('Home');
		}
	}, [db_state, navigation]);

	return (
		<View style={styles.container}>
			<Text>Welcome</Text>
			<Text>DB is {db_state}</Text>
			<Text>DB initialization progress is {db_progress * 100}%</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

export default WelcomeScreen;
