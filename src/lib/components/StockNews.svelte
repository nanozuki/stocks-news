<script lang="ts">
	import { renderNewsMarkdown } from '../markdown';
	import type { StockNewsResult } from '../stocks';

	let {
		news,
		refreshing,
		onrefresh
	}: { news: StockNewsResult; refreshing: boolean; onrefresh: () => void } = $props();
	const dateFormat = new Intl.DateTimeFormat(undefined, {
		dateStyle: 'medium',
		timeStyle: 'short'
	});
	const dayFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });
	let html = $derived(
		renderNewsMarkdown(
			news.summaryMarkdown,
			news.sources.map(({ url }) => url)
		)
	);
</script>

<section aria-labelledby="latest-news-title" class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_15rem]">
	<div class="rounded-box border border-base-300 bg-base-100 p-6 shadow-sm sm:p-9">
		<div
			class="mb-7 flex flex-wrap items-center justify-between gap-3 border-b border-base-300 pb-5"
		>
			<h2 id="latest-news-title" class="text-2xl font-semibold tracking-tight">Latest news</h2>
			<div class="flex items-center gap-3">
				<p class="text-xs text-base-content/45">
					Updated {dateFormat.format(new Date(news.searchedAt))}
				</p>
				<button
					type="button"
					class="btn btn-soft btn-primary btn-sm"
					disabled={refreshing}
					onclick={onrefresh}
					aria-label={refreshing ? 'Refreshing news' : 'Refresh news'}
				>
					{#if refreshing}<span class="loading loading-xs loading-spinner"></span>{/if}
					{refreshing ? 'Refreshing' : 'Refresh'}
				</button>
			</div>
		</div>
		<!-- renderNewsMarkdown escapes HTML and restricts links to the returned source set. -->
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		<div class="news-article">{@html html}</div>
	</div>

	<aside class="space-y-6">
		<div>
			<p class="mb-1 text-xs font-bold tracking-wider text-base-content/45 uppercase">
				Coverage period
			</p>
			<p class="text-sm font-medium">{dayFormat.format(new Date(news.periodStart))}</p>
			<p class="text-xs text-base-content/40">
				through {dayFormat.format(new Date(news.periodEnd))}
			</p>
		</div>
		<div>
			<p class="mb-3 text-xs font-bold tracking-wider text-base-content/45 uppercase">Sources</p>
			<ul class="space-y-3">
				{#each news.sources as source, index (source.url)}
					<li class="flex items-baseline gap-3">
						<span class="w-4 shrink-0 text-right font-mono text-xs text-primary">{index + 1}</span>
						<div class="min-w-0 flex-1">
							<a
								class="link text-sm font-medium link-hover"
								href={source.url}
								target="_blank"
								rel="noopener noreferrer">{source.title} ↗</a
							>
							<p class="text-xs text-base-content/45">{source.publisher}</p>
						</div>
					</li>
				{/each}
			</ul>
		</div>
	</aside>
</section>
