<script lang="ts">
	import { error } from '@sveltejs/kit';
	import { page } from '$app/state';
	import StockHeader from '../../../lib/components/StockHeader.svelte';
	import StockNews from '../../../lib/components/StockNews.svelte';
	import { summaryNewsForStock } from '../../../lib/stocks.remote';
	import { getStock, type StockNewsResult } from '../../../lib/stocks';

	const symbol = page.params.symbol ?? '';
	const stock = getStock(symbol);
	if (!stock) error(404, `We could not find the stock symbol "${symbol.toUpperCase()}".`);

	let news = $state<StockNewsResult | null>(null);
	let newsError = $state(false);

	$effect(() => {
		let active = true;
		summaryNewsForStock({ name: stock.name, symbol: stock.symbol, exchange: stock.exchange })
			.then((result) => {
				if (active) news = result;
			})
			.catch(() => {
				if (active) newsError = true;
			});
		return () => {
			active = false;
		};
	});
</script>

<svelte:head>
	<title>{stock.symbol} news | Stock News</title>
	<meta name="description" content={`Latest seven-day news summary for ${stock.name}.`} />
</svelte:head>

<StockHeader {stock} />
{#if newsError}
	<div class="alert alert-error">
		<span>We could not prepare this news summary. Please reload and try again.</span>
	</div>
{:else if news}
	<StockNews {news} />
{:else}
	<div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_15rem]" aria-label="Loading latest news">
		<div class="rounded-box border border-base-300 bg-base-100 p-9 shadow-sm">
			<div class="mb-8 h-8 w-44 skeleton"></div>
			<div class="mb-3 h-4 w-full skeleton"></div>
			<div class="mb-3 h-4 w-11/12 skeleton"></div>
			<div class="mb-8 h-4 w-3/4 skeleton"></div>
			<div class="mb-3 h-4 w-full skeleton"></div>
			<div class="h-4 w-4/5 skeleton"></div>
		</div>
		<div class="space-y-3">
			<div class="h-3 w-28 skeleton"></div>
			<div class="h-5 w-40 skeleton"></div>
		</div>
	</div>
{/if}
