import { useEffect, useState } from 'react';
import { StaticScreenProps, useNavigation } from '@react-navigation/native';
import {
	ActivityIndicator,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { useQueryClient } from '@tanstack/react-query';

import { Market } from '@/db/types';
import {
	useMarket,
	useRecentTrades,
	useRecentTradesOptions,
	useTopAsks,
	useTopAsksOptions,
	useTopBids,
	useTopBidsOptions,
} from '@/queries/markets';
import LoadingComponent from '@/components/loading';
import ErrorComponent from '@/components/error';
import useAssets from '@/stores/assets';

export type Props = {
	marketId: string;
	market?: Market;
};

type MarketScreenProps = StaticScreenProps<Props>;

function MarketScreen({ route }: MarketScreenProps) {
	return (
		<View style={styles.market_container}>
			<ScrollView>
				<MarketInternals marketId={route.params.marketId} />
			</ScrollView>
		</View>
	);
}

function MarketInternals({ marketId }: { marketId: string }) {
	const queryClient = useQueryClient();
	const navigation = useNavigation();

	const [bids_asks_count, set_bids_asks_count] = useState(10);
	const [trades_count] = useState(10);

	const { data: market, isError, isLoading, error } = useMarket(marketId);
	const bidOptions = useTopBidsOptions(marketId, bids_asks_count);
	const askOptions = useTopAsksOptions(marketId, bids_asks_count);
	const tradeOptions = useRecentTradesOptions(marketId, trades_count);

	useEffect(() => {
		queryClient.prefetchQuery(bidOptions);
		queryClient.prefetchQuery(askOptions);
		queryClient.prefetchQuery(tradeOptions);
	}, [queryClient, bidOptions, askOptions, tradeOptions]);

	useEffect(() => {
		if (market) {
			navigation.setOptions({
				title: `${market.base} / ${market.quote} Market`,
			});
		}
	}, [navigation, market]);

	if (isLoading) {
		return <LoadingComponent />;
	}

	if (isError) {
		return <ErrorComponent error={error} />;
	}

	if (!market) {
		return <ErrorComponent error="Market couldn't be retrieved" />;
	}

	return (
		<View style={styles.interals_container}>
			<View style={styles.orderbook}>
				<View style={styles.orderbook_title_row}>
					<Text style={styles.orderbook_title}>Order Book</Text>
					<View style={styles.orderbook_show_container}>
						<Text style={styles.orderbook_show_item}>Show:</Text>
						<Pressable onPress={() => set_bids_asks_count(5)}>
							<Text
								style={
									bids_asks_count === 5
										? styles.orderbook_show_item_selected
										: styles.orderbook_show_item
								}
							>
								5
							</Text>
						</Pressable>
						<Pressable onPress={() => set_bids_asks_count(10)}>
							<Text
								style={
									bids_asks_count === 10
										? styles.orderbook_show_item_selected
										: styles.orderbook_show_item
								}
							>
								10
							</Text>
						</Pressable>
						<Pressable onPress={() => set_bids_asks_count(15)}>
							<Text
								style={
									bids_asks_count === 15
										? styles.orderbook_show_item_selected
										: styles.orderbook_show_item
								}
							>
								15
							</Text>
						</Pressable>
					</View>
				</View>
				<View style={styles.bids_asks_list_container}>
					<Bids
						marketId={marketId}
						count={bids_asks_count}
						marketBase={market.base}
						marketQuote={market.quote}
					/>
					<Asks
						marketId={marketId}
						count={bids_asks_count}
						marketBase={market.base}
						marketQuote={market.quote}
					/>
				</View>
			</View>

			<Trades
				marketId={marketId}
				count={trades_count}
				marketBase={market.base}
				marketQuote={market.quote}
			/>
		</View>
	);
}

type SubViewProps = {
	marketId: string;
	count: number;
	marketBase: string;
	marketQuote: string;
};

function Bids({ marketId, count, marketBase, marketQuote }: SubViewProps) {
	const assets = useAssets(s => s.assets);
	const {
		data: bids,
		isLoading,
		isError,
		error,
		isFetching,
	} = useTopBids(marketId, count);

	if (isLoading) {
		return <LoadingComponent />;
	}

	if (isError) {
		return <ErrorComponent error={error} />;
	}

	if (!bids || bids.length === 0) {
		return <ErrorComponent error="No bids available" />;
	}

	return (
		<View style={styles.bids_asks_container}>
			<View style={styles.bids_asks_title_row}>
				<Text style={styles.bids_asks_title}>Bids</Text>
				<ActivityIndicator animating={isFetching} />
			</View>
			<View style={styles.bids_asks_line}>
				<Text style={styles.bids_asks_item}>Size ({marketBase})</Text>
				<Text style={[styles.bids_asks_item, styles.right_align]}>
					Price ({marketQuote})
				</Text>
			</View>
			{bids.map(bid => (
				<View key={bid.id} style={styles.bids_asks_line}>
					<Text style={styles.bids_asks_item}>
						{bid.size.toFixed(assets[marketBase]?.decimals ?? 2)}
					</Text>
					<Text style={[styles.bids_asks_item, styles.right_align]}>
						{bid.price.toFixed(assets[marketQuote]?.decimals ?? 2)}
					</Text>
				</View>
			))}
		</View>
	);
}

function Asks({ marketId, count, marketBase, marketQuote }: SubViewProps) {
	const assets = useAssets(s => s.assets);
	const {
		data: asks,
		isLoading,
		isError,
		error,
		isFetching,
	} = useTopAsks(marketId, count);

	if (isLoading) {
		return <LoadingComponent />;
	}

	if (isError) {
		return <ErrorComponent error={error} />;
	}

	if (!asks || asks.length === 0) {
		return <ErrorComponent error="No asks available" />;
	}

	return (
		<View style={styles.bids_asks_container}>
			<View style={styles.bids_asks_title_row}>
				<Text style={styles.bids_asks_title}>Asks</Text>
				<ActivityIndicator animating={isFetching} />
			</View>
			<View style={styles.bids_asks_line}>
				<Text style={styles.bids_asks_item}>Price ({marketQuote})</Text>
				<Text style={[styles.bids_asks_item, styles.right_align]}>
					Size ({marketBase})
				</Text>
			</View>
			{asks.map(ask => (
				<View key={ask.id} style={styles.bids_asks_line}>
					<Text style={styles.bids_asks_item}>
						{ask.price.toFixed(assets[marketQuote]?.decimals ?? 2)}
					</Text>
					<Text style={[styles.bids_asks_item, styles.right_align]}>
						{ask.size.toFixed(assets[marketBase]?.decimals ?? 2)}
					</Text>
				</View>
			))}
		</View>
	);
}

function Trades({ marketId, count, marketBase, marketQuote }: SubViewProps) {
	const assets = useAssets(s => s.assets);

	const {
		data: trades,
		isLoading,
		isError,
		error,
	} = useRecentTrades(marketId, count);

	if (isLoading) {
		return <LoadingComponent />;
	}

	if (isError) {
		return <ErrorComponent error={error} />;
	}

	if (!trades || trades.length === 0) {
		return <ErrorComponent error="No trades available" />;
	}

	return (
		<View style={styles.trades_container}>
			<Text style={styles.trades_title}>Recent Trades</Text>
			{trades.map(trade => (
				<View key={trade.tradeId} style={styles.trade_container}>
					<Text
						style={[
							styles.trade_badge,
							trade.side === 'buy'
								? styles.trade_badge_buy
								: styles.trade_badge_sell,
						]}
					>
						{trade.side}
					</Text>
					<Text style={styles.trade_text}>
						{trade.size.toFixed(assets[marketBase]?.decimals ?? 2)}{' '}
						{marketBase} at{' '}
						{trade.price.toFixed(
							assets[marketQuote]?.decimals ?? 2,
						)}{' '}
						{marketQuote}
					</Text>
				</View>
			))}
		</View>
	);
}

const styles = StyleSheet.create({
	market_container: { flex: 1 },
	interals_container: { gap: 32, paddingTop: 96, paddingBottom: 32 },
	orderbook: {
		paddingLeft: 20,
		paddingRight: 20,
		gap: 8,
	},
	orderbook_title_row: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-end',
	},
	orderbook_title: {
		fontSize: 24,
	},
	orderbook_show_container: {
		flexDirection: 'row',
		gap: 16,
	},
	orderbook_show_item: {
		fontSize: 16,
	},
	orderbook_show_item_selected: {
		fontSize: 16,
		color: 'blue',
	},
	bids_asks_list_container: {
		flexDirection: 'row',

		gap: 20,
	},
	bids_asks_container: {
		flex: 1,
	},
	bids_asks_title_row: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	bids_asks_title: {
		fontSize: 20,
	},
	bids_asks_line: {
		flexDirection: 'row',
	},
	bids_asks_item: {
		width: '50%',
	},
	right_align: {
		textAlign: 'right',
	},
	trades_container: {
		paddingLeft: 20,
		paddingRight: 20,
		gap: 8,
	},
	trades_title: {
		fontSize: 20,
	},
	trade_container: {
		flexDirection: 'row',
		gap: 16,
		alignItems: 'center',

		// backgroundColor: 'white',
		// padding: 8,
		// borderRadius: 8,
	},
	trade_badge: {
		paddingTop: 8,
		paddingBottom: 8,
		paddingLeft: 16,
		paddingRight: 16,
		borderRadius: 8,
		width: 70,

		color: 'white',
		textTransform: 'uppercase',
		textAlign: 'center',
	},
	trade_badge_buy: {
		backgroundColor: 'green',
	},
	trade_badge_sell: {
		backgroundColor: 'red',
	},
	trade_text: {
		fontSize: 16,
	},
});

export default MarketScreen;
