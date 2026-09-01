<script lang="ts">
	import Search from '../lib/components/Search.svelte';
	import StockList from '../lib/components/StockList.svelte';
	import { portfolioContext } from '../lib/portfolio.svelte';

	const portfolio = portfolioContext.get();
</script>

<svelte:head>
	<title>Stock News | Your portfolio brief</title>
	<meta
		name="description"
		content="Follow companies and read concise summaries of their latest news."
	/>
</svelte:head>

{#if portfolio.stocks.length === 0}
	<div class="mb-10 max-w-3xl sm:mb-12">
		<p class="mb-3 font-mono text-sm font-bold tracking-widest text-secondary uppercase">
			Market intelligence, simplified
		</p>
		<h1 class="mb-4 text-4xl leading-[1.05] font-semibold tracking-[-0.04em] sm:text-6xl">
			Keep up with the companies you own.
		</h1>
		<p class="max-w-2xl text-lg leading-7 text-base-content/60">
			Build a focused watchlist and get a sourced, seven-day news brief for every stock.
		</p>
	</div>
{/if}

<div class="space-y-12">
	<Search />
	<StockList />
</div>
