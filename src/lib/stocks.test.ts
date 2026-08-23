import { describe, expect, it } from 'vitest';
import { sortStocks } from './stocks';

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

describe('sortStocks', () => {
	it('orders stocks by symbol without changing the input', () => {
		const input = [microsoft, apple];
		expect(sortStocks(input).map(({ symbol }) => symbol)).toEqual(['AAPL', 'MSFT']);
		expect(input[0].symbol).toBe('MSFT');
	});
});
