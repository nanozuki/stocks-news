<script lang="ts">
	import { portfolioContext } from '../portfolio.svelte';
	import type { Stock } from '../stocks';

	const portfolio = portfolioContext.get();
	let { stock }: { stock: Stock } = $props();
</script>

<header
	class="mb-8 flex flex-col gap-6 border-b border-base-300 pb-8 sm:flex-row sm:items-end sm:justify-between"
>
	<div>
		<a
			class="mb-6 inline-flex items-center gap-2 text-sm text-base-content/50 hover:text-primary"
			href="/">← Back to portfolio</a
		>
		<div class="mb-3 flex items-center gap-3">
			<span
				class="rounded-lg bg-secondary px-3 py-1.5 font-mono text-sm font-bold tracking-wider text-secondary-content"
				>{stock.symbol}</span
			>
			<span class="text-sm text-base-content/45">{stock.exchange}</span>
		</div>
		<h1 class="text-4xl font-semibold tracking-tight sm:text-5xl">{stock.name}</h1>
		<p class="mt-3 text-base-content/60">{stock.country}</p>
	</div>
	{#if portfolio.isFollowing(stock.symbol)}
		<button class="btn shrink-0 btn-outline" onclick={() => portfolio.unfollow(stock.symbol)}
			>Unfollow</button
		>
	{:else}
		<button class="btn shrink-0 btn-primary" onclick={() => portfolio.follow(stock)}
			>+ Follow stock</button
		>
	{/if}
</header>
