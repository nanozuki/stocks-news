import { query } from '$app/server';
import {
	findStocks,
	getFakeStockNews,
	type ResolveStockResult,
	type SearchStocksInput,
	type StockNewsResult,
	type SummaryNewsInput
} from './stocks';

function assertSearchInput(input: SearchStocksInput): void {
	if (!input || typeof input.query !== 'string' || input.query.length > 2_000) {
		throw new TypeError('Search text must be a string no longer than 2,000 characters.');
	}
}

function assertNewsInput(input: SummaryNewsInput): void {
	if (
		!input ||
		[input.name, input.symbol, input.exchange].some(
			(value) => typeof value !== 'string' || value.length === 0 || value.length > 200
		)
	) {
		throw new TypeError('Company name, symbol, and exchange are required.');
	}
}

/** Searches the in-memory stock catalog after validating the remote input. */
export const searchStocks = query<SearchStocksInput, ResolveStockResult>(
	'unchecked',
	async (input) => {
		assertSearchInput(input);
		await new Promise((resolve) => setTimeout(resolve, 450));
		return findStocks(input.query);
	}
);

/** Produces a sample seven-day news summary after validating the remote input. */
export const summaryNewsForStock = query<SummaryNewsInput, StockNewsResult>(
	'unchecked',
	async (input) => {
		assertNewsInput(input);
		await new Promise((resolve) => setTimeout(resolve, 650));
		return getFakeStockNews(input);
	}
);
