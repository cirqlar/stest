import { useEffect, useState } from 'react';
import {
	Button,
	FlatList,
	ListRenderItemInfo,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useOrders } from '../../../queries/orders';
import { Order as OrderType } from '../../../db/types';

function OrdersScreen() {
	const navigation = useNavigation();

	return (
		<View style={styles.container}>
			<Text>Orders</Text>
			<OrdersInternal />
			<TouchableOpacity
				style={styles.actionButton}
				onPress={() => {
					navigation.navigate('Home', {
						screen: 'OrdersTab',
						params: { screen: 'NewOrder' },
					});
				}}
			>
				<Text>New</Text>
			</TouchableOpacity>
		</View>
	);
}

function OrdersInternal() {
	const [page, setPage] = useState(1);
	const [count] = useState(10);

	const { data, isError, isLoading, error } = useOrders({ count, page });
	const { orders, page_count } = data ?? {};

	useEffect(() => {
		if (error) console.log(error);
	}, [error]);

	if (isLoading) {
		return <Text>Loading...</Text>;
	}

	if (isError) {
		return <Text>Error</Text>;
	}

	if (orders!.length > 0) {
		return (
			<>
				<Orders orders={orders!} />
				<View style={styles.pagination}>
					<Button
						title="Previous"
						disabled={page === 1}
						onPress={() => setPage(prev => Math.max(prev - 1, 1))}
					/>
					<Text>{page}</Text>
					<Button
						title="Next"
						disabled={page === page_count}
						onPress={() =>
							setPage(prev => Math.min(prev + 1, page_count!))
						}
					/>
				</View>
			</>
		);
	} else {
		return <EmptyScreen />;
	}
}

function EmptyScreen() {
	return <Text>You Have no orders</Text>;
}

function Orders({ orders }: { orders: OrderType[] }) {
	return (
		<FlatList
			data={orders}
			renderItem={Order}
			keyExtractor={item => item.id.toString()}
			style={styles.list}
		/>
	);
}

function Order({ item: order }: ListRenderItemInfo<OrderType>) {
	return (
		<Text>
			A {order.side} at price {order.price} for {order.size} that is{' '}
			{order.status}
		</Text>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	actionButton: {
		position: 'absolute',
		bottom: 40,
		right: 40,
		width: 60,
		height: 60,
		backgroundColor: '#fefefe',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 30,
	},
	pagination: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'flex-end',
	},
	list: {
		flex: 1,
	},
});

export default OrdersScreen;
