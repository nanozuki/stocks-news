import { describe, expect, it } from 'vitest';
import { sortStocks, type Stock } from './stocks';

const apple: Stock = {
	name: 'Apple Inc.',
	symbol: 'AAPL',
	exchange: 'NASDAQ',
	country: 'United States'
};

const microsoft: Stock = {
	name: 'Microsoft Corporation',
	symbol: 'MSFT',
	exchange: 'NASDAQ',
	country: 'United States'
};

describe('sortStocks', () => {
	it('orders stocks by symbol without changing the input', () => {
		const input = [microsoft, apple];
		expect(sortStocks(input).map(({ symbol }) => symbol)).toEqual(['AAPL', 'MSFT']);
		expect(input[0].symbol).toBe('MSFT');
	});
});
