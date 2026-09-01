# [symbol]

The client-rendered route for one followed stock's latest news.

## `+page.svelte`

Resolves the route symbol against the browser-backed portfolio and returns a 404
when the stock is not followed. The component displays cached news when
available, requests a seven-day summary through the remote function, persists
successful results, supports refreshes, and ignores results from superseded
requests. It also sets the document title and description from the followed
stock.
