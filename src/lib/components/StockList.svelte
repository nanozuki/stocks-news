<script lang="ts">
	import { portfolio } from '../portfolio.svelte';
	import Stock from './Stock.svelte';
</script>

<section aria-labelledby="portfolio-title">
	<div class="mb-5 flex items-end justify-between">
		<div>
			<p class="mb-1 text-xs font-bold tracking-[0.18em] text-primary uppercase">Your portfolio</p>
			<h2 id="portfolio-title" class="text-2xl font-semibold tracking-tight">Stocks you follow</h2>
		</div>
		<span class="badge badge-outline text-base-content/50"
			>{portfolio.stocks.length} {portfolio.stocks.length === 1 ? 'company' : 'companies'}</span
		>
	</div>

	{#if portfolio.stocks.length === 0}
		<div
			class="rounded-box border border-dashed border-base-300 bg-base-100/60 px-6 py-14 text-center"
		>
			<div
				class="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-secondary/15 font-mono text-xl text-secondary"
			>
				↗
			</div>
			<h3 class="mb-1 font-semibold">Your watchlist is empty</h3>
			<p class="text-sm text-base-content/55">
				Search above and follow a company to track its latest news.
			</p>
		</div>
	{:else}
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each portfolio.stocks as stock (stock.symbol)}
				<Stock {stock} onunfollow={() => portfolio.unfollow(stock.symbol)} />
			{/each}
		</div>
	{/if}
</section>
