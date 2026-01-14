import {
	FlatList,
	ListRenderItemInfo,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { useEffect } from 'react';

import { QueryWallet, useWalletsQuery } from '@/queries/wallet';

function WalletScreen() {
	return (
		<View style={styles.container}>
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

	return (
		<>
			<Text style={styles.wallets_title}>Balances</Text>
			<Wallets wallets={wallets} />
		</>
	);
}

function Wallets({ wallets }: { wallets: QueryWallet[] }) {
	return (
		<FlatList
			data={wallets}
			renderItem={Wallet}
			keyExtractor={wallet => wallet.assetId}
			contentContainerStyle={styles.wallets_list_container}
		/>
	);
}

function Wallet({ item: wallet }: ListRenderItemInfo<QueryWallet>) {
	return (
		<View style={styles.wallet_container}>
			<View style={styles.wallet_info}>
				<Text style={styles.wallet_title}>{wallet.assetId}</Text>
				<Text style={styles.wallet_desc}>{wallet.description}</Text>
			</View>
			<View style={styles.wallet_amounts}>
				<Text style={styles.wallet_available}>
					{wallet.available.toFixed(wallet.decimals)}
				</Text>
				<Text style={styles.wallet_locked}>
					({wallet.locked.toFixed(wallet.decimals)} locked)
				</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, gap: 20, paddingTop: 96, paddingBottom: 32 },
	wallets_title: {
		fontSize: 32,
		paddingLeft: 20,
		paddingRight: 20,
		paddingTop: 32,
	},
	wallets_list_container: {
		paddingLeft: 20,
		paddingRight: 20,
		gap: 8,
	},
	wallet_container: {
		flexDirection: 'row',
		gap: 16,
		alignItems: 'stretch',

		backgroundColor: 'white',
		padding: 20,
		borderRadius: 8,
	},
	wallet_info: { flex: 1 },
	wallet_title: { fontSize: 32 },
	wallet_desc: { color: '#696767' },
	wallet_amounts: { alignItems: 'flex-end', justifyContent: 'center' },
	wallet_available: { fontSize: 24 },
	wallet_locked: { color: '#696767' },
});

export default WalletScreen;
