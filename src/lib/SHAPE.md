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

## `portfolio.svelte.ts`

Defines browser-persisted portfolio instances and the Runed context used to
share one instance through the component tree. Importing the module defines Zod
schemas and the context without accessing browser storage. Constructing a
portfolio creates its sole `PersistedState` field, which reads or initializes
`localStorage`, synchronizes changes across tabs, and uses Zod to validate and
strip stored data.

### `class Portfolio`

A reactive collection of followed stocks and cached news backed by one Runed
`PersistedState`. Create it during component initialization and provide it
through `portfolioContext`.

### `Portfolio.constructor()`

Creates a portfolio backed by the `stock-news:portfolio` local-storage entry. It
accepts the current stock-and-news object and migrates the older stock-array
format. Zod strips unknown fields and discards invalid stock and news entries;
malformed JSON or an invalid outer value produces an empty portfolio.

### `Portfolio.findNews(symbol: string): StockNewsResult | undefined`

Returns cached news for a case-insensitive symbol, or `undefined` when none
exists.

### `Portfolio.findStock(symbol: string): Stock | undefined`

Returns the followed stock for a case-insensitive symbol, or `undefined` when
none exists.

### `Portfolio.follow(stock: Stock): void`

Adds a stock when its symbol is not already followed, keeps stocks sorted by
symbol, drops fields outside the `Stock` type, and updates persisted state.

### `Portfolio.isFollowing(symbol: string): boolean`

Reports whether a stock with the case-insensitive symbol is followed.

### `Portfolio.setNews(symbol: string, news: StockNewsResult): void`

Caches news under an uppercase symbol in persisted state only when that stock is
followed.

### `Portfolio.stocks: Stock[]`

Reactive followed stocks sorted alphabetically by symbol.

### `Portfolio.unfollow(symbol: string): void`

Removes the case-insensitive symbol and its cached news from persisted state.

### `const portfolioContext`

Runed component context for providing and retrieving the nearest `Portfolio`.
Its `set` and `get` methods must be called during component initialization.

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
