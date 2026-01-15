import { act, cleanupAsync, renderHook } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { db } from '@/db';
import { Market, Order, Side } from '@/db/types';
import { useCancelOrderMutation, useNewOrderMutation } from '@/queries/orders';
import { selectSingleBalance } from '@/db/queries/balances';
import { QueryWallet } from '@/queries/wallet';
import { selectAllMarkets } from '@/db/queries/markets';
import useDB from '@/stores/db';
import useAssets from '@/stores/assets';
import { selectOrdersWithOffset } from '@/db/queries/orders';

// import { setupDB } from '@/__tests__/util/db';

jest.mock('@op-engineering/op-sqlite', () => {
	return { __esModule: true, open: () => {} };
});

jest.mock('@/db', () => {
	const datab = jest.requireActual('@/__tests__/mocks/mock_db');
	const orig = jest.requireActual('@/db');

	return {
		__esModule: true,
		...orig,
		db: new datab.DB(),
	};
});

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: false,
			gcTime: Infinity,
		},
		mutations: {
			gcTime: Infinity,
			retry: false,
		},
	},
});
const wrapper = ({ children }: { children: React.ReactNode }) => (
	<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

beforeAll(async () => {
	// setupDB(db);

	let { result: useDBResult } = renderHook(() => useDB());
	await act(async () => {
		await useDBResult.current.initialize();
	});

	let { result: useAssetsResult } = renderHook(() => useAssets());
	await act(async () => {
		await useAssetsResult.current.loadAssets();
	});
});

test('placing a sell order moves the correct amount from available to locked on the base wallet', async () => {
	const market = (await db.execute(selectAllMarkets().queryString))
		.rows[0] as Market;

	const select_wallet_query = selectSingleBalance(market.base);
	const base_wallet_before = (
		await db.execute(
			select_wallet_query.queryString,
			select_wallet_query.params,
		)
	).rows[0] as QueryWallet;

	const order = {
		marketId: market.marketId,
		price: 500,
		size: 2.1,
		side: 'sell' as Side,
	};

	let { result: useNewOrderMutationResult } = renderHook(
		() => useNewOrderMutation(),
		{ wrapper },
	);

	await act(async () => {
		await useNewOrderMutationResult.current.mutateAsync({
			order,
			market,
		});
		await cleanupAsync();
	});

	const base_wallet_after = (
		await db.execute(
			select_wallet_query.queryString,
			select_wallet_query.params,
		)
	).rows[0] as QueryWallet;

	expect(
		base_wallet_before.available - base_wallet_after.available,
	).toBeCloseTo(order.size, base_wallet_after.decimals);
	expect(base_wallet_after.locked - base_wallet_before.locked).toBeCloseTo(
		order.size,
		base_wallet_after.decimals,
	);
});

test('canceling a sell order moves the correct amount from locked to available on the base wallet', async () => {
	const market = (await db.execute(selectAllMarkets().queryString))
		.rows[0] as Market;

	const select_wallet_query = selectSingleBalance(market.base);
	const base_wallet_before = (
		await db.execute(
			select_wallet_query.queryString,
			select_wallet_query.params,
		)
	).rows[0] as QueryWallet;

	const order = {
		marketId: market.marketId,
		price: 500,
		size: 2.1,
		side: 'sell' as Side,
	};

	let { result: useNewOrderMutationResult } = renderHook(
		() => useNewOrderMutation(),
		{ wrapper },
	);

	await act(async () => {
		await useNewOrderMutationResult.current.mutateAsync({
			order,
			market,
		});
		await cleanupAsync();
	});

	const order_query = selectOrdersWithOffset(1, 0);
	const saved_order = (
		await db.execute(order_query.queryString, order_query.params)
	).rows[0] as Order;

	let { result: useCancelOrderMutationResult } = renderHook(
		() => useCancelOrderMutation(),
		{ wrapper },
	);

	await act(async () => {
		await useCancelOrderMutationResult.current.mutateAsync(saved_order.id);
		await cleanupAsync();
	});

	const base_wallet_after = (
		await db.execute(
			select_wallet_query.queryString,
			select_wallet_query.params,
		)
	).rows[0] as QueryWallet;

	expect(base_wallet_after.available).toBeCloseTo(
		base_wallet_before.available,
		base_wallet_after.decimals,
	);
	expect(base_wallet_after.locked).toBeCloseTo(
		base_wallet_before.locked,
		base_wallet_after.decimals,
	);
});

test('placing a buy order moves the correct amount from available to locked on the quote wallet', async () => {
	const market = (await db.execute(selectAllMarkets().queryString))
		.rows[0] as Market;

	const select_wallet_query = selectSingleBalance(market.quote);
	const quote_wallet_before = (
		await db.execute(
			select_wallet_query.queryString,
			select_wallet_query.params,
		)
	).rows[0] as QueryWallet;

	const order = {
		marketId: market.marketId,
		price: 500,
		size: 2.1,
		side: 'buy' as Side,
	};

	let { result: useNewOrderMutationResult } = renderHook(
		() => useNewOrderMutation(),
		{ wrapper },
	);

	await act(async () => {
		await useNewOrderMutationResult.current.mutateAsync({
			order,
			market,
		});
		await cleanupAsync();
	});

	const quote_wallet_after = (
		await db.execute(
			select_wallet_query.queryString,
			select_wallet_query.params,
		)
	).rows[0] as QueryWallet;

	expect(
		quote_wallet_before.available - quote_wallet_after.available,
	).toBeCloseTo(order.size * order.price, quote_wallet_after.decimals);
	expect(quote_wallet_after.locked - quote_wallet_before.locked).toBeCloseTo(
		order.size * order.price,
		quote_wallet_after.decimals,
	);
});

test('canceling a buy order moves the correct amount from locked to available on the quote wallet', async () => {
	const market = (await db.execute(selectAllMarkets().queryString))
		.rows[0] as Market;

	const select_wallet_query = selectSingleBalance(market.quote);
	const quote_wallet_before = (
		await db.execute(
			select_wallet_query.queryString,
			select_wallet_query.params,
		)
	).rows[0] as QueryWallet;

	const order = {
		marketId: market.marketId,
		price: 500,
		size: 2.1,
		side: 'sell' as Side,
	};

	let { result: useNewOrderMutationResult } = renderHook(
		() => useNewOrderMutation(),
		{ wrapper },
	);

	await act(async () => {
		await useNewOrderMutationResult.current.mutateAsync({
			order,
			market,
		});
		await cleanupAsync();
	});

	const order_query = selectOrdersWithOffset(1, 0);
	const saved_order = (
		await db.execute(order_query.queryString, order_query.params)
	).rows[0] as Order;

	let { result: useCancelOrderMutationResult } = renderHook(
		() => useCancelOrderMutation(),
		{ wrapper },
	);

	await act(async () => {
		await useCancelOrderMutationResult.current.mutateAsync(saved_order.id);
		await cleanupAsync();
	});

	const quote_wallet_after = (
		await db.execute(
			select_wallet_query.queryString,
			select_wallet_query.params,
		)
	).rows[0] as QueryWallet;

	expect(quote_wallet_after.available).toBeCloseTo(
		quote_wallet_before.available,
		quote_wallet_after.decimals,
	);
	expect(quote_wallet_after.locked).toBeCloseTo(
		quote_wallet_before.locked,
		quote_wallet_after.decimals,
	);
});
