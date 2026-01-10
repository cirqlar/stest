import { Link } from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';

function MarketsScreen() {
	return (
		<View style={styles.container}>
			<Text>Markets</Text>
			<Link screen="Market" params={{ id: 'cheese' }}>
				Cheese market
			</Link>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

export default MarketsScreen;
