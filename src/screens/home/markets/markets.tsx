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
import LoadingComponent from '../../../components/loading';
import ErrorComponent from '../../../components/error';
import useAssets from '../../../stores/assets';

function MarketsScreen() {
	return (
		<View style={styles.container}>
			<MarketsInternals />
		</View>
	);
}

function MarketsInternals() {
	const { data: markets, isError, isLoading, error } = useMarkets();

	if (isLoading) {
		return <LoadingComponent />;
	}

	if (isError) {
		return <ErrorComponent error={error} />;
	}

	if (!markets || markets.length === 0) {
		return <ErrorComponent error="Market data unavailable" />;
	}

	return (
		<>
			<Text style={styles.markets_title}>Markets</Text>
			<Markets markets={markets} />
		</>
	);
}

function Markets({ markets }: { markets: MarketType[] }) {
	return (
		<FlatList
			data={markets}
			renderItem={props => <Market {...props} />}
			keyExtractor={item => item.marketId}
			contentContainerStyle={styles.market_list_container}
		/>
	);
}

function Market({ item: market }: ListRenderItemInfo<MarketType>) {
	const assets = useAssets(s => s.assets);

	return (
		<View style={styles.market_container}>
			<View style={styles.market_details}>
				<Text style={styles.market_title}>
					{market.base} / {market.quote}
				</Text>
				<View style={styles.market_row}>
					<Text>
						{market.lastPrice.toFixed(
							assets[market.quote]?.decimals ?? 2,
						)}{' '}
						{market.quote}
					</Text>
					<Text
						style={
							market.change24h > 0
								? styles.market_change_positive
								: styles.market_change_negative
						}
					>
						{market.change24h > 0 && '+'}
						{market.change24h}
					</Text>
				</View>
			</View>

			<View style={styles.market_link}>
				<Link
					screen="Home"
					params={{
						screen: 'MarketsTab',
						params: {
							screen: 'Market',
							params: { marketId: market.marketId, market },
						},
					}}
				>
					View market
				</Link>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, paddingTop: 32, paddingBottom: 32, gap: 20 },
	markets_title: {
		fontSize: 32,
		paddingLeft: 20,
		paddingRight: 20,
		paddingTop: 32,
	},
	market_list_container: { paddingLeft: 20, paddingRight: 20, gap: 16 },
	market_container: {
		flexDirection: 'row',
		gap: 16,
		alignItems: 'stretch',

		backgroundColor: 'white',
		padding: 20,
		borderRadius: 8,
	},
	market_row: {
		flexDirection: 'row',
		gap: 16,
	},
	market_details: { flex: 1, gap: 8 },
	market_title: {
		fontSize: 20,
	},
	market_change_positive: { color: 'green' },
	market_change_negative: { color: 'red' },
	market_link: {
		alignItems: 'center',
		justifyContent: 'center',
	},
});

export default MarketsScreen;
