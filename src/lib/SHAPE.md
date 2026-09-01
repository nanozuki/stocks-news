# lib

Shared data types, state, storage, Markdown rendering, OpenAI integration, and
server remote functions used by the application.

## `markdown.ts`

Converts generated news Markdown to HTML under the application's link and HTML
safety rules.

### `renderNewsMarkdown(markdown: string, sourceUrls: readonly string[]): string`

Renders Markdown with raw HTML and automatic link detection disabled. Only HTTP
or HTTPS links that exactly match a supplied source URL become anchors. Every
rendered anchor opens in a new tab with `noopener noreferrer`, and numeric link
labels display in brackets.

## `openai.ts`

Implements the server-only OpenAI client for public-company resolution and
sourced news summaries. Importing the module defines schemas and response
metadata but does not create a client or make network requests.

### `type CitedNews`

News content derived from OpenAI's native URL citations.

### `CitedNews.sources: NewsSource[]`

Deduplicated source metadata in citation-number order.

### `CitedNews.summaryMarkdown: string`

Generated summary text with native citation spans replaced by numbered Markdown
links.

### `newsFromOpenAIText(parts: readonly OpenAITextWithCitations[]): CitedNews`

Converts OpenAI output-text parts into trimmed Markdown and deduplicated
sources. Citation positions are applied from right to left within each part,
repeated URLs reuse their first number, source publishers come from URL
hostnames, and malformed citation URLs can cause the URL parser to throw.

### `class OpenAI`

A server-only wrapper around the OpenAI Responses API. Instances retain a
configured client and model.

### `OpenAI.constructor(apiKey: string)`

Creates a client with two retries and a 60-second timeout. It trims and uses
`OPENAI_MODEL` when set, otherwise it uses the built-in default model. It throws
`TypeError` when the API key is empty.

### `OpenAI.searchStock(keyword: string): Promise<ResolveStockResult>`

Uses web search and strict structured output to resolve text into at most five
public-company candidates ordered by confidence. It trims the query, normalizes
symbols to uppercase, and rejects empty input or input longer than 2,000
characters with `TypeError`. Network, API, JSON, and response-schema failures
reject the promise.

### `OpenAI.summaryNewsForStock(stock: SummaryNewsInput): Promise<StockNewsResult>`

Uses web search to produce a cited Markdown article for the seven days ending
when the request begins. It trims the company fields, normalizes the symbol to
uppercase, and rejects missing, empty, or longer-than-200-character fields with
`TypeError`. Network and API failures reject the promise.

### `type OpenAITextWithCitations`

An OpenAI output-text part and its native response annotations.

### `OpenAITextWithCitations.annotations: Array<OpenAIURLCitation | { type: string }>`

All annotations attached to the text, including annotation kinds this module
ignores.

### `OpenAITextWithCitations.text: string`

The output text whose offsets the annotations reference.

### `type OpenAIURLCitation`

The URL citation fields used from an OpenAI output-text annotation.

### `OpenAIURLCitation.end_index: number`

Exclusive end offset of the cited span.

### `OpenAIURLCitation.start_index: number`

Start offset of the cited span.

### `OpenAIURLCitation.title: string`

Source title supplied by OpenAI.

### `OpenAIURLCitation.type: 'url_citation'`

Discriminant identifying a URL citation annotation.

### `OpenAIURLCitation.url: string`

Source URL supplied by OpenAI.

## `portfolio.svelte.ts`

Owns the application's singleton reactive portfolio and its browser persistence.
Importing the module creates the singleton but does not read or write
`localStorage` until a public mutation or initialization runs in a browser.

### `const portfolio`

The singleton reactive portfolio shared by application components.

### `portfolio.findNews(symbol: string): StockNewsResult | undefined`

Returns cached news for a case-insensitive symbol, or `undefined` when none
exists.

### `portfolio.findStock(symbol: string): Stock | undefined`

Returns the followed stock for a case-insensitive symbol, or `undefined` when
none exists.

### `portfolio.follow(stock: Stock): void`

Adds a stock when its symbol is not already followed, keeps stocks sorted by
symbol, drops fields outside the `Stock` type, and persists the new state in a
browser.

### `portfolio.initialize(): void`

Loads persisted portfolio state from browser `localStorage` once. It accepts the
current stock-and-news object and migrates the older stock-array format,
discards invalid entries, and removes malformed JSON. It does nothing during
server execution or after successful initialization.

### `portfolio.isFollowing(symbol: string): boolean`

Reports whether a stock with the case-insensitive symbol is followed.

### `portfolio.setNews(symbol: string, news: StockNewsResult): void`

Caches and persists news under an uppercase symbol only when that stock is
followed.

### `portfolio.stocks: Stock[]`

Reactive followed stocks sorted alphabetically by symbol.

### `portfolio.unfollow(symbol: string): void`

Removes the case-insensitive symbol and its cached news, then persists the
resulting state in a browser.

## `stock_storage.ts`

Defines a mutable in-memory store for stocks and generated news, keyed by
caller-provided symbols. It performs no normalization, validation, or
persistence.

### `class StockStorage`

An independent stock and news cache initialized with empty records.

### `StockStorage.constructor()`

Creates an empty cache.

### `StockStorage.getNews(symbol: string): StockNewsResult | undefined`

Returns news stored under the exact symbol key.

### `StockStorage.getStock(symbol: string): Stock | undefined`

Returns a stock stored under the exact symbol key.

### `StockStorage.news: Record<string, StockNewsResult>`

Mutable news records keyed by symbol.

### `StockStorage.setNews(symbol: string, news: StockNewsResult)`

Stores or replaces news under the exact symbol key.

### `StockStorage.setStock(symbol: string, stock: Stock)`

Stores or replaces a stock under the exact symbol key.

### `StockStorage.stocks: Record<string, Stock>`

Mutable stock records keyed by symbol.

## `stocks.remote.ts`

Defines server remote functions for stock search and news generation. Loading
the module registers both query endpoints and creates an empty process-local
news cache. The OpenAI client is created lazily on the first request.

### `const searchStocks`

An unchecked SvelteKit query that validates submitted search text and delegates
public-company resolution to OpenAI. It rejects missing or empty input and input
longer than 2,000 characters with `TypeError`.

### `const summaryNewsForStock`

An unchecked SvelteKit query that validates required company fields, returns
process-cached news for an exact symbol key when available, or requests and
caches a new OpenAI summary. It writes cache diagnostics to the server console
and rejects invalid input with `TypeError`.

## `stocks.ts`

Defines the stock-search and stock-news data contracts shared by client and
server code, plus stock ordering behavior.

### `type NewsSource`

A source cited by a generated stock-news summary.

### `NewsSource.publishedAt: string | null`

Publication timestamp when known, otherwise `null`.

### `NewsSource.publisher: string`

Display name or hostname of the publisher.

### `NewsSource.title: string`

Source title shown to the user.

### `NewsSource.url: string`

Source URL used by inline citations and the source list.

### `type ResolveStockResult`

The result returned by stock search.

### `ResolveStockResult.candidates: Stock[]`

Public-company candidates returned for the submitted text.

### `type SearchStocksInput`

Input accepted by stock search.

### `SearchStocksInput.query: string`

Free-form company description, name, or stock symbol to resolve.

### `type Stock`

A public-company listing returned by stock search and stored in the portfolio.

### `Stock.country: string`

Country associated with the listing.

### `Stock.exchange: string`

Exchange on which the symbol is listed.

### `Stock.name: string`

Public company name.

### `Stock.symbol: string`

Ticker symbol used as the application's stock identity.

### `type StockNewsResult`

A generated news article, its sources, and the exact search window that produced
it.

### `StockNewsResult.periodEnd: string`

ISO timestamp at the inclusive end of the searched period.

### `StockNewsResult.periodStart: string`

ISO timestamp at the inclusive start of the searched period.

### `StockNewsResult.searchedAt: string`

ISO timestamp recording when the search began.

### `StockNewsResult.sources: NewsSource[]`

Sources cited by the generated summary.

### `StockNewsResult.summaryMarkdown: string`

Generated article in Markdown with citation links.

### `type SummaryNewsInput`

The `name`, `symbol`, and `exchange` fields selected from `Stock` for a
news-summary request.

### `sortStocks(stocks: readonly Stock[]): Stock[]`

Returns a new array ordered by locale-aware symbol comparison and leaves the
input array unchanged.
