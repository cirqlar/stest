import { useEffect } from 'react';
import {
	FlatList,
	ListRenderItemInfo,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { Link } from '@react-navigation/native';

import { useMarkets } from '../../../queries/markets';
import { Market as MarketType } from '../../../db/types';

function MarketsScreen() {
	return (
		<View style={styles.container}>
			<Text>Markets</Text>
			<MarketsInternals />
		</View>
	);
}

function MarketsInternals() {
	const { data: markets, isError, isLoading, error } = useMarkets();

	useEffect(() => {
		if (error) console.log(error);
	}, [error]);

	if (isLoading) {
		return <Text>Loading...</Text>;
	}

	if (isError || !markets || markets.length === 0) {
		return <Text>Error</Text>;
	}

	return <Markets markets={markets!} />;
}

function Markets({ markets }: { markets: MarketType[] }) {
	return (
		<FlatList
			data={markets}
			renderItem={Market}
			keyExtractor={item => item.marketId}
		/>
	);
}

function Market({ item: market }: ListRenderItemInfo<MarketType>) {
	return (
		<>
			<Text>{market.marketId}</Text>
			<Link
				screen="Home"
				params={{
					screen: 'MarketsTab',
					params: {
						screen: 'Market',
						params: { marketId: market.marketId },
					},
				}}
			>
				Go to market page
			</Link>
		</>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
});

export default MarketsScreen;
