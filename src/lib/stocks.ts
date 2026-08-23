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

/** A stock stored in the local portfolio without search-ranking metadata. */
export type Stock = Omit<StockCandidate, 'confidence'>;

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

/** Returns a new stock array ordered alphabetically by ticker symbol. */
export function sortStocks(stocks: readonly Stock[]): Stock[] {
	return [...stocks].sort((a, b) => a.symbol.localeCompare(b.symbol));
}
