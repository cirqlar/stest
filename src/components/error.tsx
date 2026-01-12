import { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function ErrorComponent({ error }: { error: unknown }) {
	const [showError, setShowError] = useState(false);

	useEffect(() => {
		if (error) console.log(error);
	}, [error]);

	let canShowError = !!error;
	let error_message: string = '';

	if (error) {
		if (typeof error === 'string') {
			error_message = error;
		} else if (typeof error === 'object' && 'message' in error) {
			error_message = error.message as string;
		} else if (typeof error === 'object') {
			error_message = error.toString();
		} else {
			canShowError = false;
		}
	}

	return (
		<View style={styles.error}>
			<Text>An error occured</Text>
			<Text>
				Please restart the app or contact the developer if this issue
				persists
			</Text>
			{canShowError && (
				<>
					<Button
						title={showError ? 'Hide Error' : 'Show Error'}
						onPress={() => setShowError(prev => !prev)}
					/>
					{showError && <Text>{error_message}</Text>}
				</>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	error: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
	},
});
