import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useMarkets } from '../../../queries/markets';
import LoadingComponent from '../../../components/loading';
import ErrorComponent from '../../../components/error';
import {
	StackActions,
	useNavigation,
	usePreventRemove,
} from '@react-navigation/native';
import { Market, Order } from '../../../db/types';
import { useWalletsQuery } from '../../../queries/wallet';
import useAssets from '../../../stores/assets';
import { useNewOrderMutation } from '../../../queries/orders';

function NewOrderScreen() {
	const navigation = useNavigation();
	const [step, setStep] = useState(1);

	const [market, setMarket] = useState<Market>();
	const [order, setOrder] = useState<Partial<Order>>({
		side: 'buy',
	});

	const mutation = useNewOrderMutation();

	usePreventRemove(step !== 1 || mutation.isPending, ({ data }) => {
		console.log('Prevented remove', data);
		if (mutation.isSuccess) {
			navigation.dispatch(data.action);
		} else if (!mutation.isPending) {
			setStep(prev => prev - 1);
		}
	});

	const submit = async () => {
		if (!market) {
			return;
		}

		try {
			await mutation.mutateAsync({ market, order });
			console.log('Ran');
			// navigation.navigate("Home", { screen: 'OrdersTab', params: { screen: 'Orders' } });
			setTimeout(() => {
				navigation.dispatch(StackActions.popTo('Orders'));
				console.log('Poped to');
			});
		} catch (e) {
			console.log('Error adding order', e);
		}
	};

	if (mutation.isError) {
		return <ErrorComponent error={mutation.error} />;
	}

	if (step === 1) {
		return (
			<ChooseMarket
				selected={market}
				onSelect={newMarket => {
					setMarket(newMarket);
					setOrder(prev => ({
						...prev,
						marketId: newMarket.marketId,
					}));
					setStep(2);
				}}
			/>
		);
	}

	if (step === 2) {
		return (
			<PlaceOrder
				market={market!}
				order={order}
				submitting={mutation.isPending}
				onChange={o => setOrder(o)}
				onSubmit={submit}
			/>
		);
	}
}

function ChooseMarket({
	selected,
	onSelect,
}: {
	selected?: Market;
	onSelect: (market: Market) => void;
}) {
	const { data: markets, isLoading, isError, error } = useMarkets();

	if (isLoading) {
		return <LoadingComponent />;
	}

	if (isError) {
		return <ErrorComponent error={error} />;
	}

	if (!markets || markets.length === 0) {
		return <ErrorComponent error="Markets not retreived" />;
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Select Market</Text>
			<View style={styles.market_list_container}>
				{markets.map(market => (
					<Pressable
						onPress={() => onSelect(market)}
						key={market.marketId}
					>
						<View
							style={[
								styles.market_container,
								market.marketId === selected?.marketId
									? styles.market_container_selected
									: undefined,
							]}
						>
							<Text>
								{market.base} / {market.quote}
							</Text>
						</View>
					</Pressable>
				))}
			</View>
		</View>
	);
}

function PlaceOrder({
	market,
	order,
	submitting,
	onChange,
	onSubmit,
}: {
	market: Market;
	order: Partial<Order>;
	submitting: boolean;
	onChange: (order: Partial<Order>) => void;
	onSubmit: () => void;
}) {
	const assets = useAssets(s => s.assets);
	const { data: balances, isLoading, isError, error } = useWalletsQuery();

	const [priceInvalid, setPriceInvalid] = useState(false);
	const [sizeInvalid, setSizeInvalid] = useState(false);
	const [transactionValid, setValid] = useState(false);

	const [transactionError, setError] = useState<string>();

	const quote_amount =
		typeof order.price === 'number' && typeof order.size === 'number'
			? order.price * order.size
			: undefined;

	useEffect(() => {
		if (quote_amount) {
			if (order.side === 'sell') {
				const base_wallet = balances!.find(
					b => b.assetId === market.base,
				);

				if (!base_wallet) {
					setValid(false);
					setError('Empty Balance');
				} else if (order.size! > base_wallet.available) {
					setValid(false);
					setError(
						`Please enter an amount less than your ${
							market.base
						} balance: ${base_wallet.available.toFixed(
							assets[market.base]?.decimals ?? 2,
						)}`,
					);
				} else {
					setValid(true);
					setError(undefined);
				}
			} else {
				const quote_wallet = balances!.find(
					b => b.assetId === market.quote,
				);

				if (!quote_wallet) {
					setValid(false);
					setError('Empty Balance');
				} else if (quote_amount > quote_wallet.available) {
					setValid(false);
					setError(
						`Please enter an amount less than your ${
							market.quote
						} balance: ${quote_wallet.available.toFixed(
							assets[market.quote]?.decimals ?? 2,
						)}`,
					);
				} else {
					setValid(true);
					setError(undefined);
				}
			}
		} else {
			setValid(false);
			setError(undefined);
		}
	}, [
		quote_amount,
		order.side,
		order.size,
		market.base,
		market.quote,
		balances,
		assets,
	]);

	if (isLoading) {
		return <LoadingComponent />;
	}

	if (isError) {
		return <ErrorComponent error={error} />;
	}

	if (!balances || balances.length === 0) {
		return <ErrorComponent error="Balances not retreived" />;
	}

	const updateState = (partial: Partial<Order>) => {
		onChange({
			...order,
			...partial,
		});
	};

	const updatePrice = (text: string) => {
		let price = Number(text.trim());

		if (text.trim() === '' || isNaN(price)) {
			setPriceInvalid(true);
		} else {
			setPriceInvalid(false);
			updateState({ price });
		}
	};

	const updateSize = (text: string) => {
		let size = Number(text.trim());

		if (text.trim() === '' || isNaN(size)) {
			setSizeInvalid(true);
		} else {
			setSizeInvalid(false);
			updateState({ size });
		}
	};

	const can_submit =
		transactionValid && !priceInvalid && !sizeInvalid && !submitting;

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Enter Details</Text>

			<View style={styles.form_container}>
				<View style={styles.form_group}>
					<Text style={styles.form_label}>Market</Text>
					<TextInput
						style={styles.form_input}
						value={`${market.base} / ${market.quote}`}
						editable={false}
					/>
				</View>

				<View style={styles.form_toggle_group}>
					<Pressable
						style={styles.form_toggle_button}
						onPress={() => updateState({ side: 'buy' })}
					>
						<View
							style={[
								styles.form_toggle_container,
								styles.form_toggle_buy,
								order.side === 'buy'
									? styles.form_toggle_selected
									: undefined,
							]}
						>
							<Text>Buy</Text>
						</View>
					</Pressable>
					<Pressable
						style={styles.form_toggle_button}
						onPress={() => updateState({ side: 'sell' })}
					>
						<View
							style={[
								styles.form_toggle_container,
								styles.form_toggle_sell,
								order.side === 'sell'
									? styles.form_toggle_selected
									: undefined,
							]}
						>
							<Text>Sell</Text>
						</View>
					</Pressable>
				</View>

				<View style={styles.form_group}>
					<Text style={styles.form_label}>
						Price ({market.quote})
					</Text>
					<TextInput
						inputMode="decimal"
						style={styles.form_input}
						placeholder="1000.00"
						defaultValue={order.price?.toString()}
						onChangeText={updatePrice}
					/>
					{priceInvalid && (
						<Text style={styles.form_error}>
							Please enter a valid amount
						</Text>
					)}
				</View>
				<View style={styles.form_group}>
					<Text style={styles.form_label}>Size ({market.base})</Text>
					<TextInput
						inputMode="decimal"
						style={styles.form_input}
						placeholder="1000.00"
						defaultValue={order.size?.toString()}
						onChangeText={updateSize}
					/>
					{sizeInvalid && (
						<Text style={styles.form_error}>
							Please enter a valid amount
						</Text>
					)}
				</View>

				<View style={styles.form_group}>
					<Text style={styles.form_label}>{market.quote} amount</Text>
					<TextInput
						inputMode="decimal"
						style={styles.form_input}
						value={quote_amount?.toString()}
						editable={false}
					/>
				</View>

				{transactionError && (
					<Text style={styles.form_error}>{transactionError}</Text>
				)}

				<Pressable disabled={!can_submit} onPress={() => onSubmit()}>
					<View
						style={[
							styles.form_button,
							can_submit
								? styles.form_button_enabled
								: styles.form_button_disabled,
						]}
					>
						<Text style={styles.form_button_text}>
							{submitting ? 'Submitting' : 'Place Limit Order'}
						</Text>
					</View>
				</Pressable>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, paddingTop: 0, paddingBottom: 32, gap: 20 },
	title: { fontSize: 32, paddingLeft: 20, paddingRight: 20, paddingTop: 24 },
	market_list_container: {
		paddingLeft: 20,
		paddingRight: 20,
		gap: 8,
	},
	market_container: {
		backgroundColor: 'white',
		padding: 20,
		borderRadius: 8,
	},
	market_container_selected: {
		backgroundColor: 'lightblue',
	},
	form_container: {
		gap: 20,
		paddingLeft: 20,
		paddingRight: 20,
	},

	form_group: {
		gap: 8,
	},
	form_label: {
		fontSize: 16,
	},
	form_input: {
		paddingVertical: 12,
		paddingHorizontal: 20,
		backgroundColor: 'white',
		borderRadius: 8,

		fontSize: 16,
	},

	form_toggle_group: {
		flexDirection: 'row',
	},
	form_toggle_button: {
		flex: 1,
	},
	form_toggle_container: {
		paddingVertical: 12,
		paddingHorizontal: 20,
		backgroundColor: 'white',

		fontSize: 16,
		alignItems: 'center',
		justifyContent: 'center',
	},
	form_toggle_buy: {
		borderTopLeftRadius: 8,
		borderBottomLeftRadius: 8,
	},
	form_toggle_sell: {
		borderTopRightRadius: 8,
		borderBottomRightRadius: 8,
	},
	form_toggle_selected: {
		backgroundColor: 'lightblue',
	},

	form_error: {
		color: 'red',
	},

	form_button: {
		// flex: 1,
		borderRadius: 8,
		padding: 20,
		alignItems: 'center',
		justifyContent: 'center',
	},
	form_button_enabled: {
		backgroundColor: 'blue',
	},
	form_button_disabled: {
		backgroundColor: 'gray',
	},
	form_button_text: {
		color: 'white',
		fontSize: 16,
		fontWeight: 'bold',
	},
});

export default NewOrderScreen;
