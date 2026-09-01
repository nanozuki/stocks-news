import type { Stock, StockNewsResult } from './stocks';

export class StockStorage {
	public stocks: Record<string, Stock> = {};
	public news: Record<string, StockNewsResult> = {};

	setStock(symbol: string, stock: Stock) {
		this.stocks[symbol] = stock;
	}

	getStock(symbol: string): Stock | undefined {
		return this.stocks[symbol];
	}

	setNews(symbol: string, news: StockNewsResult) {
		this.news[symbol] = news;
	}

	getNews(symbol: string): StockNewsResult | undefined {
		return this.news[symbol];
	}
}
