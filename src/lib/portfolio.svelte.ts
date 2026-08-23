import { sortStocks, type Stock, type StockNewsResult } from './stocks';

const storageKey = 'stock-news:portfolio';
const browser = typeof window !== 'undefined';

/** Manages followed stocks and their latest news, persisting every change in localStorage. */
class Portfolio {
	stocks = $state<Stock[]>([]);
	private newsBySymbol = $state<Record<string, StockNewsResult>>({});
	private initialized = false;

	/** Loads persisted stocks after hydration so server and initial client output agree. */
	initialize(): void {
		if (!browser || this.initialized) return;
		this.initialized = true;
		try {
			const saved: unknown = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
			if (Array.isArray(saved)) {
				// Migrate portfolios stored before news caching was added.
				this.stocks = sortStocks(saved.filter(isStock));
			} else if (saved && typeof saved === 'object') {
				const stored = saved as Record<string, unknown>;
				if (Array.isArray(stored.stocks)) this.stocks = sortStocks(stored.stocks.filter(isStock));
				if (stored.news && typeof stored.news === 'object') {
					this.newsBySymbol = Object.fromEntries(
						Object.entries(stored.news).filter((entry): entry is [string, StockNewsResult] =>
							isStockNewsResult(entry[1])
						)
					);
				}
			}
		} catch {
			localStorage.removeItem(storageKey);
		}
	}

	/** Returns the followed stock matching a symbol, without regard to case. */
	findStock(symbol: string): Stock | undefined {
		return this.stocks.find((stock) => stock.symbol === symbol.toUpperCase());
	}

	/** Returns cached news for a symbol, without regard to case. */
	findNews(symbol: string): StockNewsResult | undefined {
		return this.newsBySymbol[symbol.toUpperCase()];
	}

	/** Stores the latest news for a followed stock. */
	setNews(symbol: string, news: StockNewsResult): void {
		const normalizedSymbol = symbol.toUpperCase();
		if (!this.isFollowing(normalizedSymbol)) return;
		this.newsBySymbol = { ...this.newsBySymbol, [normalizedSymbol]: news };
		this.persist();
	}

	/** Reports whether the portfolio contains the given symbol. */
	isFollowing(symbol: string): boolean {
		return this.findStock(symbol) !== undefined;
	}

	/** Adds a stock once, preserving alphabetical symbol order and stored fields. */
	follow(stock: Stock): void {
		if (this.isFollowing(stock.symbol)) return;
		const storedStock: Stock = {
			name: stock.name,
			symbol: stock.symbol,
			exchange: stock.exchange,
			country: stock.country
		};
		this.stocks = sortStocks([...this.stocks, storedStock]);
		this.persist();
	}

	/** Removes the stock and its cached news for the given symbol. */
	unfollow(symbol: string): void {
		const normalizedSymbol = symbol.toUpperCase();
		this.stocks = this.stocks.filter((stock) => stock.symbol !== normalizedSymbol);
		const remainingNews = { ...this.newsBySymbol };
		delete remainingNews[normalizedSymbol];
		this.newsBySymbol = remainingNews;
		this.persist();
	}

	private persist(): void {
		if (browser) {
			localStorage.setItem(
				storageKey,
				JSON.stringify({ stocks: this.stocks, news: this.newsBySymbol })
			);
		}
	}
}

function isStock(value: unknown): value is Stock {
	if (!value || typeof value !== 'object') return false;
	const stock = value as Record<string, unknown>;
	return ['name', 'symbol', 'exchange', 'country'].every((key) => typeof stock[key] === 'string');
}

function isStockNewsResult(value: unknown): value is StockNewsResult {
	if (!value || typeof value !== 'object') return false;
	const news = value as Record<string, unknown>;
	if (
		!['summaryMarkdown', 'periodStart', 'periodEnd', 'searchedAt'].every(
			(key) => typeof news[key] === 'string'
		) ||
		!Array.isArray(news.sources)
	) {
		return false;
	}
	return news.sources.every((value) => {
		if (!value || typeof value !== 'object') return false;
		const source = value as Record<string, unknown>;
		return (
			['title', 'url', 'publisher'].every((key) => typeof source[key] === 'string') &&
			(typeof source.publishedAt === 'string' || source.publishedAt === null)
		);
	});
}

/** The single client-side portfolio used throughout the application. */
export const portfolio = new Portfolio();
