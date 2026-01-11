import { SQLBatchTuple } from '@op-engineering/op-sqlite';

export type Migration = {
	name: string;
	query: SQLBatchTuple[] | (() => SQLBatchTuple[]);
};

export type Market = {
	id: number;
	marketId: string;
	base: string;
	quote: string;
	tickSize: number;
	minOrderSize: number;
	initialLastPrice: number;
	initialChange24h: number;
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
	side: string;
	price: number;
	size: number;
	status: string;
	created_at: number;
	last_updated: number;
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
	side: string;
	timestamp: number;
};
