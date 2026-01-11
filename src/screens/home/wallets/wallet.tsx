import {
	FlatList,
	ListRenderItemInfo,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { useEffect } from 'react';

import { QueryWallet, useWalletsQuery } from '../../../queries/wallet';

function WalletScreen() {
	return (
		<View style={styles.container}>
			<Text>Wallet</Text>
			<WalletInternal />
		</View>
	);
}

function WalletInternal() {
	const { data: wallets, isLoading, isError, error } = useWalletsQuery();

	useEffect(() => {
		if (error) console.log(error);
	}, [error]);

	if (isLoading) {
		return <Text>Loading...</Text>;
	}

	if (isError || !wallets || wallets.length === 0) {
		return <Text>Error</Text>;
	}

	return <Wallets wallets={wallets} />;
}

function Wallets({ wallets }: { wallets: QueryWallet[] }) {
	return (
		<FlatList
			data={wallets}
			renderItem={Wallet}
			keyExtractor={wallet => wallet.assetId}
		/>
	);
}

function Wallet({ item: wallet }: ListRenderItemInfo<QueryWallet>) {
	return (
		<>
			<Text>{wallet.assetId} wallet</Text>
			<Text>
				Avaliable balance: {wallet.available} ({wallet.locked} locked)
			</Text>
			<Text>{wallet.description}</Text>
		</>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

export default WalletScreen;
