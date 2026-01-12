import { SQLBatchTuple } from '@op-engineering/op-sqlite';

export type Migration = {
	name: string;
	query: SQLBatchTuple[] | (() => SQLBatchTuple[]);
};

export type Side = 'buy' | 'sell';

export type Market = {
	id: number;
	marketId: string;
	base: string;
	quote: string;
	tickSize: number;
	minOrderSize: number;
	lastPrice: number;
	change24h: number;
};

export type Wallet = {
	id: number;
	assetId: string;
	available: number;
	locked: number;
};

export type Asset = {
	id: number;
	assetId: string;
	decimals: number;
	description: string;
};

export type Order = {
	id: number;
	marketId: string;
	side: Side;
	price: number;
	size: number;
	status: 'pending' | 'cancelled';
	created_at: number;
	last_updated: number;

	base: string;
	quote: string;
	tickSize: number;
	minOrderSize: number;
};

export type OrderBookItem = {
	id: number;
	marketId: string;
	price: number;
	size: number;
};

export type Trade = {
	id: number;
	tradeId: string;
	marketId: string;
	price: number;
	size: number;
	side: Side;
	timestamp: number;
};
