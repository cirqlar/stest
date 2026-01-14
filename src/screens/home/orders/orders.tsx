import { useState } from 'react';
import {
	Button,
	FlatList,
	Pressable,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useCancelOrderMutation, useOrders } from '@/queries/orders';
import { Order as OrderType } from '@/db/types';
import LoadingComponent from '@/components/loading';
import ErrorComponent from '@/components/error';
import useAssets from '@/stores/assets';

function OrdersScreen() {
	const navigation = useNavigation();

	return (
		<View style={styles.container}>
			<OrdersInternal />
			<TouchableOpacity
				style={styles.action_button}
				onPress={() => {
					navigation.navigate('Home', {
						screen: 'OrdersTab',
						params: { screen: 'NewOrder' },
					});
				}}
			>
				<Text style={styles.action_button_text}>+</Text>
			</TouchableOpacity>
		</View>
	);
}

function OrdersInternal() {
	const [page, setPage] = useState(1);
	const [count] = useState(10);

	const { data, isError, isLoading, error } = useOrders({ count, page });
	const { orders, page_count } = data ?? {};

	const cancelOrderMutation = useCancelOrderMutation();

	if (isLoading) {
		return <LoadingComponent />;
	}

	if (isError) {
		return <ErrorComponent error={error} />;
	}

	if (!orders) {
		return <ErrorComponent error="Orders not retrieved" />;
	}

	return (
		<>
			<Text style={styles.orders_title}>Orders</Text>
			{orders.length > 0 ? (
				<>
					<Orders
						orders={orders}
						cancel={cancelOrderMutation.mutateAsync}
						disableCancel={cancelOrderMutation.isPending}
					/>
					{page_count! > 1 && (
						<View style={styles.pagination}>
							<Button
								title="Previous"
								disabled={
									page === 1 || cancelOrderMutation.isPending
								}
								onPress={() =>
									setPage(prev => Math.max(prev - 1, 1))
								}
							/>
							<Text>{page}</Text>
							<Button
								title="Next"
								disabled={
									page === page_count ||
									cancelOrderMutation.isPending
								}
								onPress={() =>
									setPage(prev =>
										Math.min(prev + 1, page_count!),
									)
								}
							/>
						</View>
					)}
				</>
			) : (
				<EmptyScreen />
			)}
		</>
	);
}

function EmptyScreen() {
	return (
		<View style={styles.empty_screen_container}>
			<Text style={styles.empty_screen_text}>
				You have no orders yet.
			</Text>
		</View>
	);
}

function Orders({
	orders,
	cancel,
	disableCancel,
}: {
	orders: OrderType[];
	cancel: (orderId: number) => void;
	disableCancel: boolean;
}) {
	return (
		<FlatList
			data={orders}
			renderItem={({ item }) => (
				<Order
					order={item}
					cancel={cancel}
					disableCancel={disableCancel}
				/>
			)}
			keyExtractor={item => item.id.toString()}
			contentContainerStyle={styles.orders_container}
		/>
	);
}

function Order({
	order,
	cancel,
	disableCancel,
}: {
	order: OrderType;
	cancel: (orderId: number) => void;
	disableCancel: boolean;
}) {
	const assets = useAssets(s => s.assets);

	const disabled = order.status === 'cancelled' || disableCancel;

	return (
		<View style={styles.order_container}>
			<Text
				style={[
					styles.order_badge,
					order.side === 'buy'
						? styles.order_badge_buy
						: styles.order_badge_sell,
				]}
			>
				{order.side}
			</Text>
			<View style={styles.order_info}>
				<View style={styles.order_info_item}>
					<Text style={styles.order_title}>
						Price ({order.quote})
					</Text>
					<Text style={styles.order_value}>
						{order.price.toFixed(
							assets[order.quote]?.decimals ?? 2,
						)}
					</Text>
				</View>
				<View style={styles.order_info_item}>
					<Text style={styles.order_title}>Size ({order.base})</Text>
					<Text style={styles.order_value}>
						{order.size.toFixed(assets[order.base]?.decimals ?? 2)}
					</Text>
				</View>
				<View style={styles.order_info_item}>
					<Text style={styles.order_title}>{order.quote} Value</Text>
					<Text style={styles.order_value}>
						{(order.size * order.price).toFixed(
							assets[order.quote]?.decimals ?? 2,
						)}
					</Text>
				</View>
				<View style={styles.order_info_item}>
					<Text style={styles.order_title}>Status</Text>
					<Text style={[styles.order_value, styles.order_status]}>
						{order.status}
					</Text>
				</View>
			</View>
			<Pressable disabled={disabled} onPress={() => cancel(order.id)}>
				<View style={styles.order_cancel_container}>
					<Text
						style={[
							styles.order_cancel_text,
							disabled
								? styles.order_cancel_text_disabled
								: undefined,
						]}
					>
						{order.status === 'pending' ? 'Cancel' : ''}
					</Text>
				</View>
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, paddingTop: 96, paddingBottom: 32, gap: 20 },
	action_button: {
		position: 'absolute',
		bottom: 40,
		right: 40,
		width: 60,
		height: 60,
		backgroundColor: '#171616',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 8,

		elevation: 5,
		shadowColor: '#000',
	},
	action_button_text: {
		color: 'white',
		fontSize: 36,
	},

	orders_title: {
		fontSize: 32,
		paddingLeft: 20,
		paddingRight: 20,
		paddingTop: 32,
	},

	empty_screen_container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	empty_screen_text: {
		fontSize: 20,
	},

	pagination: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'flex-start',

		paddingLeft: 20,
		paddingRight: 20,
	},

	orders_container: {
		paddingLeft: 20,
		paddingRight: 20,
		gap: 8,
	},

	order_container: {
		flexDirection: 'row',
		gap: 16,
		alignItems: 'stretch',

		backgroundColor: 'white',
		padding: 8,
		borderRadius: 8,
	},
	order_badge: {
		paddingTop: 8,
		paddingBottom: 8,
		paddingLeft: 16,
		paddingRight: 16,
		borderRadius: 8,
		width: 70,

		color: 'white',
		textTransform: 'uppercase',
		textAlign: 'center',
		textAlignVertical: 'center',
	},
	order_badge_buy: {
		backgroundColor: 'green',
	},
	order_badge_sell: {
		backgroundColor: 'red',
	},
	order_info: {
		flex: 1,
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 8,
	},
	order_info_item: {
		width: '45%',
	},
	order_title: {
		fontWeight: 'bold',
	},
	order_value: {
		fontSize: 16,
	},
	order_status: {
		textTransform: 'capitalize',
	},

	order_cancel_container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		width: 60,
	},
	order_cancel_text: {
		fontSize: 16,
		color: 'red',
	},
	order_cancel_text_disabled: {
		color: 'grey',
	},
});

export default OrdersScreen;
