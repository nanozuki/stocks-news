# Page structure

This document defines the page hierarchy and component responsibilities. Component comments will
define detailed behavior and UI states.

## Shared layout

The root SvelteKit layout provides:

- A "Stock News" link to `/`
- The main content container

## Portfolio page

Route: `/`

```text
Root layout
└── Portfolio page
    ├── Search
    └── StockList
        └── Stock
```

### `<Search />`

`<Search />` owns the stock search form and its results.

- Submits through a SvelteKit remote function when the user presses Enter or uses the search button
- Displays results only after submission, rather than searching as the user types
- Lets the user follow a stock from a result
- Keeps result rows inside the component instead of reusing `<Stock />`
- Does not navigate when the user clicks a result

### `<StockList />`

`<StockList />` displays followed stocks, ordered alphabetically by symbol. It renders one
`<Stock />` for each followed stock.

### `<Stock />`

`<Stock />` displays:

- Stock symbol
- Company name
- One-sentence company description
- Unfollow button

The stock's main content links to `/stocks/:symbol`. The unfollow button is a separate action and
does not navigate.

## Stock detail page

Route: `/stocks/:symbol`

```text
Root layout
└── Stock detail page
    ├── StockHeader
    └── StockNews
```

### `<StockHeader />`

`<StockHeader />` displays:

- Stock symbol
- Company name
- The same one-sentence company description used by `<Stock />`
- A follow or unfollow control for the displayed stock

### `<StockNews />`

`<StockNews />` displays one LLM-generated article that summarizes the stock's latest news. It
contains:

- A "Latest news" heading
- The time the summary was last updated
- The summary rendered from Markdown, with links to source material included inline

## Error page

SvelteKit's error page handles invalid stock symbols and other missing routes. It includes a link to
`/`.

## Deferred design

This is a single-user application. One client-side object will manage followed-stock state and
persistence in `localStorage`. Its interface, UI states, and the data-loading design for stock
details and news will be specified later.
