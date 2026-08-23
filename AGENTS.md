# Project architecture

- This is a client-side rendered SvelteKit application. Preserve its CSR architecture when changing
  routing, data loading, or browser-dependent code.
- The project uses Svelte's experimental `async` and `remoteFunctions` features. Account for their
  experimental APIs and behavior when changing related code.

# Styling

- Use daisyUI and Tailwind CSS to style the application.
