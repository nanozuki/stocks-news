# routes

Top-level SvelteKit route components, browser-rendering policy, and global
application styles.

## `+error.svelte`

Renders the current SvelteKit error status and message with a link back to the
portfolio, and sets the document title from the status.

## `+layout.svelte`

Renders the persistent application navigation, active child route, and
disclaimer. Loading the component imports global styles. Constructing it
initializes the browser-backed portfolio and sets the document favicon and theme
color.

### `props.children`

Required snippet containing the active child route.

## `+page.svelte`

Renders the portfolio home page with its introductory copy, stock search, and
followed-stock list, and sets the document title and description.

## `layout.css`

Loads Tailwind CSS and daisyUI, defines the `stocknews` theme, applies global
page backgrounds and interaction styles, and styles generated news article
markup.
