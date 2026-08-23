import { describe, expect, it } from 'vitest';
import { findStocks, getFakeStockNews, sortStocks } from './stocks';

const apple = {
	name: 'Apple Inc.',
	symbol: 'AAPL',
	exchange: 'NASDAQ',
	country: 'United States',
	confidence: 1,
	description: 'Apple designs consumer electronics, software, and digital services.'
};

const microsoft = {
	name: 'Microsoft Corporation',
	symbol: 'MSFT',
	exchange: 'NASDAQ',
	country: 'United States',
	confidence: 1,
	description: 'Microsoft develops software, cloud services, devices, and business applications.'
};

describe('findStocks', () => {
	it('finds a company by name, symbol, or description', () => {
		expect(findStocks('apple').candidates[0]?.symbol).toBe('AAPL');
		expect(findStocks('MSFT').candidates[0]?.name).toBe('Microsoft Corporation');
		expect(findStocks('electric cars').candidates[0]?.symbol).toBe('TSLA');
	});

	it('returns no candidates for blank or unknown input', () => {
		expect(findStocks('  ')).toEqual({ candidates: [] });
		expect(findStocks('a company that does not exist')).toEqual({ candidates: [] });
	});
});

describe('sortStocks', () => {
	it('orders stocks by symbol without changing the input', () => {
		const input = [microsoft, apple];
		expect(sortStocks(input).map(({ symbol }) => symbol)).toEqual(['AAPL', 'MSFT']);
		expect(input[0].symbol).toBe('MSFT');
	});
});

describe('getFakeStockNews', () => {
	it('returns a seven-day summary with links from its source set', () => {
		const result = getFakeStockNews({
			name: apple.name,
			symbol: apple.symbol,
			exchange: apple.exchange
		});
		const period = new Date(result.periodEnd).getTime() - new Date(result.periodStart).getTime();

		expect(period).toBe(7 * 24 * 60 * 60 * 1000);
		expect(result.sources.length).toBeGreaterThan(0);
		for (const match of result.summaryMarkdown.matchAll(/\]\((https?:\/\/[^)]+)\)/g)) {
			expect(result.sources.map(({ url }) => url)).toContain(match[1]);
		}
	});
});
