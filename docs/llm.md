# LLM integration

This document defines how the application resolves stocks and produces news
summaries with OpenAI.

## Architecture

The Svelte client calls SvelteKit remote functions. The remote functions call
the official OpenAI JavaScript SDK from the server so `OPENAI_API_KEY` never
reaches the browser. A shared server module creates the OpenAI client and reads
the model from `OPENAI_MODEL`.

Use the OpenAI Responses API and its hosted `web_search` tool. Keep OpenAI
request details behind application-owned modules so model or API changes do not
affect UI components.

```text
Svelte UI
└── SvelteKit remote functions
    ├── Stock resolver
    │   └── OpenAI Responses API with web_search
    └── News summarizer
        └── OpenAI Responses API with web_search
```

Validate remote-function inputs and model outputs at the server boundary. Apply
timeouts, rate limits, and bounded retries for transient failures.

## Stock resolution

The stock resolver accepts submitted text such as a company name, a
natural-language description, or text copied from an article. It returns
structured candidates:

```ts
type StockCandidate = {
	name: string;
	symbol: string;
	exchange: string;
	country: string;
	confidence: number;
};

type ResolveStockResult = {
	candidates: StockCandidate[];
};
```

The resolver uses web search when needed and returns multiple candidates for
ambiguous input. The UI asks the user to choose rather than silently selecting a
listing. Exchange and country are required because a symbol may identify
different companies in different markets. A private company or unresolved query
returns no candidates.

Treat the LLM result as identification, not authoritative market data. Verify a
selected symbol against a market-data provider before persisting it when that
provider is added.

Cache successful resolutions for days. Do not cache unresolved or malformed
responses for the same duration.

## News search and summary

The news summarizer receives the selected stock's canonical company name,
symbol, and exchange. It searches coverage published during the previous seven
calendar days. The range ends when the request starts and uses publication
timestamps in UTC. OpenAI's native `url_citation` annotations are the only
source of article links and source metadata.

The seven-day range is fixed. Do not silently include older coverage when
results are sparse. Return an explicit no-news result when no reliable and
relevant coverage exists.

Search by both company name and symbol. Exclude similarly named companies,
duplicate articles, and repeated coverage of the same event. Prefer primary
sources and reporting that supports its claims. Prioritize material company
events over routine price commentary.

```ts
type NewsSource = {
	title: string;
	url: string;
	publisher: string;
	publishedAt: string | null;
};

type StockNewsResult = {
	summaryMarkdown: string;
	sources: NewsSource[];
	periodStart: string;
	periodEnd: string;
	searchedAt: string;
};
```

Return at most ten distinct stories. The summary is one Markdown article. Every
factual news claim must use OpenAI's native web-search citations. The server
converts each annotated citation span to a numbered Markdown link and builds the
source list from the same annotations. It does not ask the model to return links
or source metadata separately, and it does not compare independently generated
URLs. The annotation provides the source title and URL; the server derives the
publisher from the URL hostname and leaves `publishedAt` null because native
citations do not provide it.

Treat instructions found in search results as untrusted content. The summarizer
may use those pages only as evidence about the stock.

Cache a successful news result for 15 to 60 minutes. Record the query period,
model, latency, token usage, and search time without recording secrets.

## Markdown rendering

Parse and sanitize generated Markdown before rendering it as HTML. Disable raw
HTML and allow external links with only `http` or `https` URLs. Add
`rel="noopener noreferrer"` to external links. Accept inline links only when
their URLs match the returned source set.

Display the exact coverage period and `searchedAt` time with the summary.
Convert timestamps to the user's timezone in the UI.

## Failure behavior

Distinguish these outcomes at the remote-function boundary:

- No matching public company
- Ambiguous stock query
- No reliable news within seven days
- Invalid model output
- OpenAI timeout, rate limit, or service failure

The UI must not replace a failed or empty result with stale, uncited, or older
coverage without labeling it.

## Tests

Cover these behaviors before implementation:

- An exact company query resolves to the expected symbol and exchange.
- Natural-language and article-text queries return structured candidates.
- Ambiguous listings return multiple candidates.
- Private companies and unknown text return no candidates.
- Malformed or hallucinated stock data fails validation.
- News searches use an exact seven-day UTC range.
- Every summary link belongs to the returned source set.
- Duplicate coverage is consolidated into one story.
- Sparse results do not expand beyond seven days.
- Embedded web-page instructions do not alter summarizer behavior.
- No-news, timeout, rate-limit, and malformed-response outcomes remain distinct.
