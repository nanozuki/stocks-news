import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { portfolio } from './portfolio.svelte';
import type { Stock, StockNewsResult } from './stocks';

const apple: Stock = {
	name: 'Apple Inc.',
	symbol: 'AAPL',
	exchange: 'NASDAQ',
	country: 'United States'
};

const appleNews: StockNewsResult = {
	summaryMarkdown: 'Apple released an update.',
	sources: [
		{
			title: 'Apple releases an update',
			url: 'https://example.com/apple-update',
			publisher: 'example.com',
			publishedAt: null
		}
	],
	periodStart: '2026-03-14T12:00:00.000Z',
	periodEnd: '2026-03-21T12:00:00.000Z',
	searchedAt: '2026-03-21T12:00:00.000Z'
};

describe('portfolio', () => {
	beforeEach(() => portfolio.unfollow(apple.symbol));
	afterEach(() => portfolio.unfollow(apple.symbol));

	it('finds a followed stock by symbol without regard to case', () => {
		portfolio.follow(apple);

		expect(portfolio.findStock('aapl')).toEqual(apple);
	});

	it('returns undefined for a stock that is not followed', () => {
		expect(portfolio.findStock('AAPL')).toBeUndefined();
	});

	it('stores and finds news by symbol without regard to case', () => {
		portfolio.follow(apple);

		portfolio.setNews('aapl', appleNews);

		expect(portfolio.findNews('AAPL')).toEqual(appleNews);
		expect(JSON.parse(localStorage.getItem('stock-news:portfolio') ?? '{}').news.AAPL).toEqual(
			appleNews
		);
	});

	it('removes stored news when its stock is unfollowed', () => {
		portfolio.follow(apple);
		portfolio.setNews(apple.symbol, appleNews);

		portfolio.unfollow(apple.symbol);

		expect(portfolio.findNews(apple.symbol)).toBeUndefined();
	});
});
