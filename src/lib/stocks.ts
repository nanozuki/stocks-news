/** A public-company candidate returned by stock search. */
export type StockCandidate = {
	name: string;
	symbol: string;
	exchange: string;
	country: string;
	confidence: number;
};

/** The result returned by the stock-search remote function. */
export type ResolveStockResult = { candidates: StockCandidate[] };

/** A stock stored in the local portfolio, including display copy. */
export type Stock = StockCandidate & { description: string };

/** A source used by a generated stock-news summary. */
export type NewsSource = {
	title: string;
	url: string;
	publisher: string;
	publishedAt: string | null;
};

/** The generated news article and the exact search window that produced it. */
export type StockNewsResult = {
	summaryMarkdown: string;
	sources: NewsSource[];
	periodStart: string;
	periodEnd: string;
	searchedAt: string;
};

/** Input accepted by the stock-search remote function. */
export type SearchStocksInput = { query: string };

/** Input accepted by the stock-news remote function. */
export type SummaryNewsInput = Pick<Stock, 'name' | 'symbol' | 'exchange'>;

const catalog: Stock[] = [
	{
		name: 'Apple Inc.',
		symbol: 'AAPL',
		exchange: 'NASDAQ',
		country: 'United States',
		confidence: 0.99,
		description: 'Apple designs consumer electronics, software, and digital services.'
	},
	{
		name: 'Microsoft Corporation',
		symbol: 'MSFT',
		exchange: 'NASDAQ',
		country: 'United States',
		confidence: 0.99,
		description: 'Microsoft develops software, cloud services, devices, and business applications.'
	},
	{
		name: 'NVIDIA Corporation',
		symbol: 'NVDA',
		exchange: 'NASDAQ',
		country: 'United States',
		confidence: 0.99,
		description: 'NVIDIA designs accelerated computing chips and related software.'
	},
	{
		name: 'Tesla, Inc.',
		symbol: 'TSLA',
		exchange: 'NASDAQ',
		country: 'United States',
		confidence: 0.98,
		description: 'Tesla makes electric vehicles, energy storage systems, and solar products.'
	},
	{
		name: 'Amazon.com, Inc.',
		symbol: 'AMZN',
		exchange: 'NASDAQ',
		country: 'United States',
		confidence: 0.99,
		description: 'Amazon operates online retail, cloud computing, and digital media businesses.'
	},
	{
		name: 'Alphabet Inc.',
		symbol: 'GOOGL',
		exchange: 'NASDAQ',
		country: 'United States',
		confidence: 0.98,
		description: 'Alphabet owns Google and develops internet, advertising, and AI products.'
	}
];

/** Returns canonical display data for a supported symbol. */
export function getStock(symbol: string): Stock | undefined {
	const found = catalog.find((stock) => stock.symbol === symbol.toUpperCase());
	if (!found) return undefined;
	return { ...found };
}

/** Returns a new stock array ordered alphabetically by ticker symbol. */
export function sortStocks(stocks: readonly Stock[]): Stock[] {
	return [...stocks].sort((a, b) => a.symbol.localeCompare(b.symbol));
}
