<script lang="ts">
	import type { Stock as StockData } from '../stocks';

	let { stock, onunfollow }: { stock: StockData; onunfollow: () => void } = $props();
</script>

<article
	class="group rounded-box border border-base-300 bg-base-100 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
>
	<div class="flex items-center justify-between gap-3 px-6 pt-6">
		<span
			class="rounded-lg bg-secondary px-3 py-1.5 font-mono text-sm font-bold tracking-wider text-secondary-content"
			>{stock.symbol}</span
		>
		<div class="flex items-center gap-1">
			<a
				class="btn btn-circle btn-ghost text-xl text-base-content/35 transition btn-sm group-hover:translate-x-1 group-hover:text-primary"
				href={`/stocks/${stock.symbol}`}
				aria-label={`Read latest ${stock.name} news`}>→</a
			>
			<button
				class="btn btn-circle btn-ghost text-base-content/45 btn-sm hover:btn-error"
				onclick={onunfollow}
				aria-label={`Unfollow ${stock.name}`}
				title="Unfollow"
			>
				<svg
					class="size-4"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					aria-hidden="true"><path d="M3 6h18M8 6V4h8v2m-7 4v7m6-7v7M6 6l1 15h10l1-15" /></svg
				>
			</button>
		</div>
	</div>
	<a
		class="block px-6 pt-7 pb-6"
		href={`/stocks/${stock.symbol}`}
		aria-label={`Read latest ${stock.name} news`}
	>
		<h3 class="text-xl font-semibold tracking-tight">{stock.name}</h3>
		<p class="mt-2 text-sm text-base-content/55">{stock.exchange} · {stock.country}</p>
	</a>
</article>
