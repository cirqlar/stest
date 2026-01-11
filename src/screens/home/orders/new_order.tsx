import { StyleSheet, Text, View } from 'react-native';

function NewOrderScreen() {
	return (
		<View style={styles.container}>
			<Text>New Order</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
});

export default NewOrderScreen;
