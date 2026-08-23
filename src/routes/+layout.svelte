<script lang="ts">
	import './layout.css';
	import favicon from '../lib/assets/favicon.svg';
	import { portfolio } from '../lib/portfolio.svelte';

	let { children } = $props();

	portfolio.initialize();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="theme-color" content="#133c36" />
</svelte:head>

<div class="min-h-screen">
	<header class="sticky top-0 z-20 border-b border-base-300 bg-base-100/85 backdrop-blur-lg">
		<nav
			class="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8"
			aria-label="Main navigation"
		>
			<a class="flex items-center gap-3 font-semibold tracking-tight" href="/">
				<span
					class="grid size-8 place-items-center rounded-lg bg-primary font-mono text-sm text-primary-content"
					>SN</span
				>
				Stock News
			</a>
			<span class="hidden text-xs tracking-wider text-base-content/45 uppercase sm:block"
				>Signal over noise</span
			>
		</nav>
	</header>
	<main class="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">{@render children()}</main>
	<footer class="mx-auto max-w-6xl px-5 py-8 text-xs text-base-content/35 sm:px-8">
		News summaries are not investment advice.
	</footer>
</div>
