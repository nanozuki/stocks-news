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

type CatalogStock = Stock & { keywords: string };

function toStock(stock: CatalogStock): Stock {
	return {
		name: stock.name,
		symbol: stock.symbol,
		exchange: stock.exchange,
		country: stock.country,
		confidence: stock.confidence,
		description: stock.description
	};
}

function toCandidate(stock: CatalogStock): StockCandidate {
	return {
		name: stock.name,
		symbol: stock.symbol,
		exchange: stock.exchange,
		country: stock.country,
		confidence: stock.confidence
	};
}

const catalog: CatalogStock[] = [
	{
		name: 'Apple Inc.',
		symbol: 'AAPL',
		exchange: 'NASDAQ',
		country: 'United States',
		confidence: 0.99,
		description: 'Apple designs consumer electronics, software, and digital services.',
		keywords: 'iphone mac ipad consumer technology phones computers'
	},
	{
		name: 'Microsoft Corporation',
		symbol: 'MSFT',
		exchange: 'NASDAQ',
		country: 'United States',
		confidence: 0.99,
		description: 'Microsoft develops software, cloud services, devices, and business applications.',
		keywords: 'windows azure cloud software artificial intelligence'
	},
	{
		name: 'NVIDIA Corporation',
		symbol: 'NVDA',
		exchange: 'NASDAQ',
		country: 'United States',
		confidence: 0.99,
		description: 'NVIDIA designs accelerated computing chips and related software.',
		keywords: 'gpu chips semiconductors artificial intelligence gaming'
	},
	{
		name: 'Tesla, Inc.',
		symbol: 'TSLA',
		exchange: 'NASDAQ',
		country: 'United States',
		confidence: 0.98,
		description: 'Tesla makes electric vehicles, energy storage systems, and solar products.',
		keywords: 'electric cars ev automotive batteries energy elon musk'
	},
	{
		name: 'Amazon.com, Inc.',
		symbol: 'AMZN',
		exchange: 'NASDAQ',
		country: 'United States',
		confidence: 0.99,
		description: 'Amazon operates online retail, cloud computing, and digital media businesses.',
		keywords: 'shopping ecommerce aws cloud retail delivery'
	},
	{
		name: 'Alphabet Inc.',
		symbol: 'GOOGL',
		exchange: 'NASDAQ',
		country: 'United States',
		confidence: 0.98,
		description: 'Alphabet owns Google and develops internet, advertising, and AI products.',
		keywords: 'google search youtube advertising artificial intelligence'
	}
];

/** Finds mock stock candidates using names, symbols, descriptions, and a small keyword index. */
export function findStocks(query: string): ResolveStockResult {
	const normalized = query.trim().toLowerCase();
	if (!normalized) return { candidates: [] };

	const terms = normalized.split(/\s+/).filter((term) => term.length > 1);
	const matches = catalog
		.map((stock) => {
			const haystack =
				`${stock.name} ${stock.symbol} ${stock.description} ${stock.keywords}`.toLowerCase();
			const score =
				stock.symbol.toLowerCase() === normalized
					? 100
					: terms.reduce((total, term) => total + (haystack.includes(term) ? 1 : 0), 0);
			return { stock, score };
		})
		.filter(({ score }) => score > 0)
		.sort((a, b) => b.score - a.score || a.stock.symbol.localeCompare(b.stock.symbol))
		.slice(0, 5)
		.map(({ stock, score }) => {
			const candidate = toCandidate(stock);
			return {
				...candidate,
				confidence: Math.min(candidate.confidence, 0.72 + score * 0.08)
			};
		});

	return { candidates: matches };
}

/** Returns canonical display data for a supported mock symbol. */
export function getStock(symbol: string): Stock | undefined {
	const found = catalog.find((stock) => stock.symbol === symbol.toUpperCase());
	if (!found) return undefined;
	return toStock(found);
}

/** Returns a new stock array ordered alphabetically by ticker symbol. */
export function sortStocks(stocks: readonly Stock[]): Stock[] {
	return [...stocks].sort((a, b) => a.symbol.localeCompare(b.symbol));
}

/** Builds a mock news response with a fixed seven-day UTC search window. */
export function getFakeStockNews(input: SummaryNewsInput): StockNewsResult {
	const searchedAt = new Date();
	const periodEnd = searchedAt.toISOString();
	const periodStart = new Date(searchedAt.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
	const symbol = input.symbol.toUpperCase();
	const sourceUrl = `https://www.sec.gov/edgar/browse/?CIK=${encodeURIComponent(symbol)}`;
	const newsroomUrl = `https://finance.yahoo.com/quote/${encodeURIComponent(symbol)}/news/`;

	return {
		summaryMarkdown: `## ${input.name} in brief\n\n${input.name} remained in focus as investors weighed recent company updates and broader market conditions. The latest public disclosures are available through the [SEC company filings page](${sourceUrl}).\n\nCoverage during the period centered on the company's current strategy and expectations for its next reporting cycle. See the [latest collected coverage](${newsroomUrl}) for the underlying reports. This is a sample summary generated by the app's fake remote function.`,
		sources: [
			{
				title: `${input.name} company filings`,
				url: sourceUrl,
				publisher: 'U.S. Securities and Exchange Commission',
				publishedAt: null
			},
			{
				title: `${input.name} latest news`,
				url: newsroomUrl,
				publisher: 'Yahoo Finance',
				publishedAt: periodEnd
			}
		],
		periodStart,
		periodEnd,
		searchedAt: periodEnd
	};
}
