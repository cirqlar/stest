import { ActivityIndicator, StyleSheet } from 'react-native';

export default function LoadingComponent() {
	return <ActivityIndicator style={styles.loading} />;
}

const styles = StyleSheet.create({
	loading: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
});
