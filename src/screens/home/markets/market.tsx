import {
	Link,
	StackActions,
	StaticScreenProps,
} from '@react-navigation/native';
import { StyleSheet, Text, View } from 'react-native';
import {
	useMarket,
	useRecentTrades,
	useTopAsks,
	useTopBids,
} from '../../../queries/markets';
import { useEffect, useState } from 'react';

type Props = StaticScreenProps<{
	marketId: string;
}>;

function MarketScreen({ route }: Props) {
	return (
		<View style={styles.container}>
			<Text>{route.params.marketId} Market</Text>
			<MarketInternals marketId={route.params.marketId} />
		</View>
	);
}

function MarketInternals({ marketId }: { marketId: string }) {
	const [count] = useState(10);

	const { data: market, isError, isLoading, error } = useMarket(marketId);

	useEffect(() => {
		if (error) console.log(error);
	}, [error]);

	if (isLoading) {
		return <Text>Loading...</Text>;
	}

	if (isError) {
		return <Text>Error</Text>;
	}

	return (
		<>
			<Text>{market!.marketId}</Text>
			<Text>base {market!.base}</Text>
			<Text>quote {market!.quote}</Text>
			<Link
				screen="Home"
				params={{ screen: 'MarketsTab', params: { screen: 'Markets' } }}
				action={StackActions.popTo('Markets')}
			>
				Go back to Markets
			</Link>

			<View style={styles.bids_asks_list_container}>
				<Bids marketId={marketId} count={count} />
				<Asks marketId={marketId} count={count} />
			</View>

			<Trades marketId={marketId} />
		</>
	);
}

function Bids({ marketId, count }: { marketId: string; count: number }) {
	const {
		data: bids,
		isLoading,
		isError,
		error,
	} = useTopBids(marketId, count);

	if (isLoading) {
		return <View>Loading</View>;
	}

	if (isError || !bids || bids.length === 0) {
		return <View>Error {error?.message}</View>;
	}

	return (
		<View style={styles.bids_asks_container}>
			<Text>Bids</Text>
			<View style={styles.bids_asks_line}>
				<Text style={styles.bids_asks_item}>Size</Text>
				<Text style={styles.bids_asks_item}>Price</Text>
			</View>
			{bids.map(bid => (
				<View key={bid.id} style={styles.bids_asks_line}>
					<Text style={styles.bids_asks_item}>{bid.size}</Text>
					<Text style={styles.bids_asks_item}>{bid.price}</Text>
				</View>
			))}
		</View>
	);
}

function Asks({ marketId, count }: { marketId: string; count: number }) {
	const {
		data: asks,
		isLoading,
		isError,
		error,
	} = useTopAsks(marketId, count);

	if (isLoading) {
		return <View>Loading</View>;
	}

	if (isError || !asks || asks.length === 0) {
		return <View>Error {error?.message}</View>;
	}

	return (
		<View style={styles.bids_asks_container}>
			<Text>Asks</Text>
			<View style={styles.bids_asks_line}>
				<Text style={styles.bids_asks_item}>Size</Text>
				<Text style={styles.bids_asks_item}>Price</Text>
			</View>
			{asks.map(ask => (
				<View key={ask.id} style={styles.bids_asks_line}>
					<Text style={styles.bids_asks_item}>{ask.size}</Text>
					<Text style={styles.bids_asks_item}>{ask.price}</Text>
				</View>
			))}
		</View>
	);
}

function Trades({ marketId }: { marketId: string }) {
	const {
		data: trades,
		isLoading,
		isError,
		error,
	} = useRecentTrades(marketId, 10);

	if (isLoading) {
		return <View>Loading</View>;
	}

	if (isError || !trades || trades.length === 0) {
		return <View>Error {error?.message}</View>;
	}

	return (
		<View>
			<Text>Trades</Text>
			{trades.map(trade => (
				<View key={trade.tradeId}>
					<Text>
						{trade.side} {trade.size} at {trade.price}
					</Text>
				</View>
			))}
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	bids_asks_list_container: {
		flexDirection: 'row',
	},
	bids_asks_container: {
		flex: 1,
		paddingLeft: 20,
		paddingRight: 20,
	},
	bids_asks_line: {
		flexDirection: 'row',
	},
	bids_asks_item: {
		width: '50%',
	},
});

export default MarketScreen;
