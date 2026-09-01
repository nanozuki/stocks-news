# Stock News

Stock News creates a sourced brief of material news published during the
previous seven days for a public company. Users can find companies, keep a
watchlist in the browser, and refresh each brief on demand.

## Feature choices

Search accepts a company name, ticker, or description. Rather than silently
choose a listing, the app returns up to five candidates with their exchange and
country. The user makes the final choice.

The watchlist gives users a portfolio-like view without pretending to track
positions. I left holdings and accounts out because they do not affect the
news-summary flow.

The fixed seven-day period gives "latest" a concrete meaning, and native
citations let readers check the evidence. The last successful brief remains
visible during refresh and is saved in `localStorage` with its generation time.
This local version relies on manual refresh; the production notes below describe
cache expiry and background updates.

## Run locally

The app requires Node.js, pnpm, and an OpenAI API key with access to the
Responses API and web search.

```sh
pnpm install
export OPENAI_API_KEY="your-api-key"
pnpm dev --open
```

The app defaults to `gpt-5.6-luna`. To use another model, set `OPENAI_MODEL`
before starting it:

```sh
export OPENAI_MODEL="<model-id>"
```

Only server-side code reads the OpenAI API key. The browser never receives it.

## Design decisions

### SvelteKit

I chose SvelteKit to keep the UI and server-side OpenAI calls in one TypeScript
project. Framework-specific code stays in components and remote functions. Stock
models and response processing remain plain TypeScript.

### OpenAI and citations

Remote functions validate each request before calling the OpenAI Responses API.
Company search uses hosted web search and a strict JSON schema. News summaries
use the same search tool over the fixed seven-day period, and links come only
from native URL citation annotations.

The server turns citation spans into numbered Markdown links. The renderer
disables raw HTML and rejects links that are absent from the returned source
list.

### Client-side portfolio

The task does not require accounts, so each browser stores its watchlist and
last successful briefs in `localStorage`. The root route uses client-side
rendering to read that state. OpenAI requests still run on the SvelteKit server.

## Testing strategy

Vitest runs separate Node.js and browser projects:

- Node.js tests cover stock ordering, citation conversion, Markdown rendering,
  and source-link filtering.
- Browser tests use Playwright with headless Chromium. They cover portfolio
  state, `localStorage` writes, source display, and refresh behavior.
- Two live tests call the OpenAI Responses API to check company resolution and
  the seven-day summary contract. They require `OPENAI_API_KEY` and depend on
  current web results.

Run all checks after setting `OPENAI_API_KEY`:

```sh
pnpm run check
pnpm run lint
pnpm test
pnpm run build
```

`pnpm test` includes the two live OpenAI tests. The remaining tests use fixed
data and make no network calls.

## AI-assisted development

I used OpenAI Codex to compare framework options and draft parts of the
implementation and tests. I reviewed and refactored its output, then ran the
checks above and verified the integration against real OpenAI responses.

## Production considerations

A multi-user service would need authentication and a relational database for
portfolios. I would keep summary responses in a shared cache with expiry and
request coalescing.

A background worker could refresh followed stocks before their cached briefs
expire. Most page loads could then return a cached brief without waiting for
OpenAI. The job queue would deduplicate refreshes, and usage limits would
control API costs.

Before saving a listing, the server should verify it through a market-data
provider rather than rely on the model alone.
