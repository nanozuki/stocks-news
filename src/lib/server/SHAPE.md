# server

Server only modules

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
