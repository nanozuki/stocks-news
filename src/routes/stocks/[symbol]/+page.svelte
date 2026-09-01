<script lang="ts">
	import { error } from '@sveltejs/kit';
	import { page } from '$app/state';
	import StockHeader from '../../../lib/components/StockHeader.svelte';
	import StockNews from '../../../lib/components/StockNews.svelte';
	import { portfolioContext } from '../../../lib/portfolio.svelte';
	import { summaryNewsForStock } from '../../../lib/stocks.remote';
	import type { StockNewsResult } from '../../../lib/stocks';

	const portfolio = portfolioContext.get();
	const symbol = page.params.symbol?.toUpperCase() ?? '';
	const stock = portfolio.findStock(symbol);
	if (!stock) error(404, `We could not find the stock symbol "${symbol}".`);
	const newsInput = { name: stock.name, symbol: stock.symbol, exchange: stock.exchange };

	let newsQuery: ReturnType<typeof summaryNewsForStock> | undefined;
	let news = $state<StockNewsResult | null>(portfolio.findNews(symbol) ?? null);
	let newsError = $state(false);
	let refreshing = $state(false);
	let requestVersion = 0;

	function getNewsQuery(): ReturnType<typeof summaryNewsForStock> {
		newsQuery ??= summaryNewsForStock(newsInput);
		return newsQuery;
	}

	async function loadNews(refresh: boolean): Promise<void> {
		const version = ++requestVersion;
		if (!refresh) {
			const cachedNews = portfolio.findNews(symbol);
			if (cachedNews) {
				news = cachedNews;
				newsError = false;
				return;
			}
		}

		refreshing = true;
		newsError = false;
		try {
			const query = getNewsQuery();
			if (refresh) await query.refresh();
			else await query;
			if (version === requestVersion && query.ready) {
				news = query.current;
				portfolio.setNews(symbol, query.current);
			}
		} catch {
			if (version === requestVersion) newsError = true;
		} finally {
			if (version === requestVersion) refreshing = false;
		}
	}

	async function refreshNews(): Promise<void> {
		await loadNews(true);
	}

	$effect(() => {
		void loadNews(false);
		return () => {
			requestVersion++;
		};
	});
</script>

<svelte:head>
	<title>{stock.symbol} news | Stock News</title>
	<meta name="description" content={`Latest seven-day news summary for ${stock.name}.`} />
</svelte:head>

<StockHeader {stock} />
{#if newsError}
	<div class="mb-6 alert alert-error">
		<span>
			We could not prepare this news summary.
			{news ? 'Please use Refresh to try again.' : 'Please reload and try again.'}
		</span>
	</div>
{/if}
{#if news}
	<StockNews {news} {refreshing} onrefresh={refreshNews} />
{:else if !newsError}
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
