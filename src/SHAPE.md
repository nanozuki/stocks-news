# src

Source code root.

## `app.d.ts`

Declares project-specific members of SvelteKit's global `App` namespace. The
namespace is currently empty and the file exports nothing at runtime.

### `namespace App {}`

The extension point for application-specific SvelteKit types.

## `app.html`

Provides the outer HTML document for every route. SvelteKit replaces its head
and body placeholders at render time, and the body opts into data preloading
when users hover links.
