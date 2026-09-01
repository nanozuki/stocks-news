import { Context, PersistedState } from 'runed';
import { z } from 'zod';
import { sortStocks, type Stock, type StockNewsResult } from './stocks';

const storageKey = 'stock-news:portfolio';

const stockSchema = z.object({
	name: z.string(),
	symbol: z.string(),
	exchange: z.string(),
	country: z.string()
});

const newsSourceSchema = z.object({
	title: z.string(),
	url: z.string(),
	publisher: z.string(),
	publishedAt: z.string().nullable()
});

const stockNewsSchema = z.object({
	summaryMarkdown: z.string(),
	sources: z.array(newsSourceSchema),
	periodStart: z.string(),
	periodEnd: z.string(),
	searchedAt: z.string()
});

const storedStocksSchema = z.array(z.unknown()).transform((values) =>
	sortStocks(
		values.flatMap((value) => {
			const result = stockSchema.safeParse(value);
			return result.success ? [result.data] : [];
		})
	)
);

const storedNewsSchema = z.record(z.string(), z.unknown()).transform((values) =>
	Object.fromEntries(
		Object.entries(values).flatMap(([symbol, value]) => {
			const result = stockNewsSchema.safeParse(value);
			return result.success ? [[symbol, result.data]] : [];
		})
	)
);

const storedPortfolioSchema = z.union([
	storedStocksSchema.transform((stocks) => ({ stocks, news: {} })),
	z
		.object({
			stocks: storedStocksSchema.catch([]),
			news: storedNewsSchema.catch({})
		})
		.transform(({ stocks, news }) => ({ stocks, news }))
]);

type PortfolioState = {
	stocks: Stock[];
	news: Record<string, StockNewsResult>;
};

function emptyPortfolio(): PortfolioState {
	return { stocks: [], news: {} };
}

const portfolioSerializer = {
	serialize: JSON.stringify,
	deserialize(value: string): PortfolioState {
		try {
			const result = storedPortfolioSchema.safeParse(JSON.parse(value));
			return result.success ? result.data : emptyPortfolio();
		} catch {
			return emptyPortfolio();
		}
	}
};

/** A reactive collection of followed stocks and cached news backed by browser storage. */
export class Portfolio {
	private readonly state: PersistedState<PortfolioState>;

	/** Creates a portfolio from validated persisted data, or an empty portfolio when none exists. */
	constructor() {
		this.state = new PersistedState(storageKey, emptyPortfolio(), {
			serializer: portfolioSerializer
		});
	}

	/** Followed stocks sorted alphabetically by symbol. */
	get stocks(): Stock[] {
		return this.state.current.stocks;
	}

	/** Returns the followed stock matching a symbol, without regard to case. */
	findStock(symbol: string): Stock | undefined {
		return this.stocks.find((stock) => stock.symbol === symbol.toUpperCase());
	}

	/** Returns cached news for a symbol, without regard to case. */
	findNews(symbol: string): StockNewsResult | undefined {
		return this.state.current.news[symbol.toUpperCase()];
	}

	/** Stores the latest news for a followed stock. */
	setNews(symbol: string, news: StockNewsResult): void {
		const normalizedSymbol = symbol.toUpperCase();
		if (!this.isFollowing(normalizedSymbol)) return;
		const current = this.state.current;
		this.state.current = {
			...current,
			news: { ...current.news, [normalizedSymbol]: news }
		};
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
		const current = this.state.current;
		this.state.current = {
			...current,
			stocks: sortStocks([...current.stocks, storedStock])
		};
	}

	/** Removes the stock and its cached news for the given symbol. */
	unfollow(symbol: string): void {
		const normalizedSymbol = symbol.toUpperCase();
		const current = this.state.current;
		const remainingNews = { ...current.news };
		delete remainingNews[normalizedSymbol];
		this.state.current = {
			stocks: current.stocks.filter((stock) => stock.symbol !== normalizedSymbol),
			news: remainingNews
		};
	}
}

/** Provides the nearest portfolio instance to components during initialization. */
export const portfolioContext = new Context<Portfolio>('portfolio');
