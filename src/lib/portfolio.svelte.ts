import { sortStocks, type Stock } from './stocks';

const storageKey = 'stock-news:portfolio';
const browser = typeof window !== 'undefined';

/** Manages the followed stocks and persists every change in localStorage. */
class Portfolio {
	stocks = $state<Stock[]>([]);
	private initialized = false;

	/** Loads persisted stocks after hydration so server and initial client output agree. */
	initialize(): void {
		if (!browser || this.initialized) return;
		this.initialized = true;
		try {
			const saved = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
			if (Array.isArray(saved)) this.stocks = sortStocks(saved.filter(isStock));
		} catch {
			localStorage.removeItem(storageKey);
		}
	}

	/** Reports whether the portfolio contains the given symbol. */
	isFollowing(symbol: string): boolean {
		return this.stocks.some((stock) => stock.symbol === symbol.toUpperCase());
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

	/** Removes the stock with the given symbol. */
	unfollow(symbol: string): void {
		this.stocks = this.stocks.filter((stock) => stock.symbol !== symbol.toUpperCase());
		this.persist();
	}

	private persist(): void {
		if (browser) localStorage.setItem(storageKey, JSON.stringify(this.stocks));
	}
}

function isStock(value: unknown): value is Stock {
	if (!value || typeof value !== 'object') return false;
	const stock = value as Record<string, unknown>;
	return ['name', 'symbol', 'exchange', 'country'].every((key) => typeof stock[key] === 'string');
}

/** The single client-side portfolio used throughout the application. */
export const portfolio = new Portfolio();
