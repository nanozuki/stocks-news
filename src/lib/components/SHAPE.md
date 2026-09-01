# components

Reusable Svelte components for stock search, portfolio display, stock controls,
and rendered news.

## `Search.svelte`

Renders a company search form and candidate list. Submitting calls the
stock-search remote function, and following a result mutates the shared
portfolio. The component has no props.

## `Stock.svelte`

Renders one followed stock as a linked card with an unfollow control.

### `props.onunfollow: () => void`

Required callback invoked when the user activates the unfollow button.

### `props.stock: StockData`

Required stock displayed by the card and used to build its detail link.

## `StockHeader.svelte`

Renders a stock-detail heading and a follow or unfollow button backed by the
shared portfolio.

### `props.stock: Stock`

Required stock whose identity and current follow state the header displays.

## `StockList.svelte`

Renders the shared portfolio as stock cards or an empty-state message. Unfollow
actions mutate the portfolio. The component has no props.

## `StockNews.svelte`

Renders a stock's Markdown news summary, coverage dates, numbered sources, and
refresh control. Generated HTML comes from the restricted news Markdown
renderer, and source links open in a new tab.

### `props.news: StockNewsResult`

Required generated article, source list, and coverage timestamps to display.

### `props.onrefresh: () => void`

Required callback invoked when the user requests fresh news.

### `props.refreshing: boolean`

Required state that disables and relabels the refresh button while a request
runs.
