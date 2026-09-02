import { query } from '$app/server';
import { OpenAI } from './server/openai';
import { StockStorage } from './stock_storage';
import type {
	ResolveStockResult,
	SearchStocksInput,
	StockNewsResult,
	SummaryNewsInput
} from './stocks';

let openAI: OpenAI | undefined;

function getOpenAI(): OpenAI {
	openAI ??= new OpenAI(process.env.OPENAI_API_KEY ?? '');
	return openAI;
}

function assertSearchInput(input: SearchStocksInput): void {
	if (
		!input ||
		typeof input.query !== 'string' ||
		input.query.trim().length === 0 ||
		input.query.length > 2_000
	) {
		throw new TypeError('Search text must be a string no longer than 2,000 characters.');
	}
}

function assertNewsInput(input: SummaryNewsInput): void {
	if (
		!input ||
		[input.name, input.symbol, input.exchange].some(
			(value) => typeof value !== 'string' || value.trim().length === 0 || value.length > 200
		)
	) {
		throw new TypeError('Company name, symbol, and exchange are required.');
	}
}

const stockCaches = new StockStorage();

/** Resolves submitted text to public-company candidates through OpenAI. */
export const searchStocks = query<SearchStocksInput, ResolveStockResult>(
	'unchecked',
	async (input) => {
		assertSearchInput(input);
		return getOpenAI().searchStock(input.query);
	}
);

/** Produces a sourced seven-day news summary through OpenAI. */
export const summaryNewsForStock = query<SummaryNewsInput, StockNewsResult>(
	'unchecked',
	async (input) => {
		assertNewsInput(input);
		const news = stockCaches.getNews(input.symbol);
		console.log('get news from caches', news);
		if (news) {
			return news;
		}
		const result = await getOpenAI().summaryNewsForStock(input);
		stockCaches.setNews(input.symbol, result);
		console.log('set news to cache', news);
		return result;
	}
);
