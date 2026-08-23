<script lang="ts">
	import { portfolio } from '../portfolio.svelte';
	import { searchStocks } from '../stocks.remote';
	import { getStock, type StockCandidate } from '../stocks';

	let query = $state('');
	let candidates = $state<StockCandidate[] | null>(null);
	let searching = $state(false);
	let message = $state('');

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		if (!query.trim() || searching) return;
		searching = true;
		message = '';
		try {
			const result = await searchStocks({ query });
			candidates = result.candidates;
		} catch {
			message = 'Stock search is unavailable right now. Please try again.';
		} finally {
			searching = false;
		}
	}

	function follow(candidate: StockCandidate) {
		const stock = getStock(candidate.symbol);
		if (!stock) return;
		portfolio.follow(stock);
	}
</script>

<section
	class="rounded-box border border-base-300 bg-base-100 p-5 shadow-sm sm:p-6"
	aria-labelledby="search-title"
>
	<div class="mb-4">
		<p class="mb-1 text-xs font-bold tracking-[0.18em] text-primary uppercase">Find a company</p>
		<h2 id="search-title" class="text-2xl font-semibold tracking-tight">Add to your watchlist</h2>
	</div>

	<form class="join w-full" onsubmit={submit}>
		<label class="input join-item w-full border-base-300 input-lg focus-within:border-primary">
			<svg
				class="size-5 opacity-45"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				aria-hidden="true"
			>
				<circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path>
			</svg>
			<input
				bind:value={query}
				type="search"
				placeholder="Try Apple, NVDA, or electric cars"
				aria-label="Company or stock symbol"
			/>
		</label>
		<button
			class="btn join-item px-7 btn-lg btn-primary"
			type="submit"
			disabled={!query.trim() || searching}
		>
			{#if searching}<span class="loading loading-sm loading-spinner"></span>{/if}
			Search
		</button>
	</form>

	{#if message}
		<div class="mt-4 alert alert-error" role="alert">{message}</div>
	{:else if candidates}
		<div class="mt-5 border-t border-base-300 pt-2" aria-live="polite">
			{#if candidates.length === 0}
				<p class="py-5 text-center text-base-content/60">No matching public companies found.</p>
			{:else}
				<p class="px-2 py-3 text-xs font-semibold tracking-wider text-base-content/50 uppercase">
					Search results
				</p>
				<ul class="divide-y divide-base-300">
					{#each candidates as candidate (candidate.symbol)}
						<li class="flex items-center gap-4 px-2 py-3">
							<div
								class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-black text-primary"
							>
								{candidate.symbol.slice(0, 2)}
							</div>
							<div class="min-w-0 flex-1">
								<p class="truncate font-semibold">{candidate.name}</p>
								<p class="text-sm text-base-content/55">
									{candidate.symbol} · {candidate.exchange} · {candidate.country}
								</p>
							</div>
							<button
								class="btn btn-sm"
								class:btn-success={!portfolio.isFollowing(candidate.symbol)}
								disabled={portfolio.isFollowing(candidate.symbol)}
								onclick={() => follow(candidate)}
							>
								{portfolio.isFollowing(candidate.symbol) ? 'Following' : '+ Follow'}
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	{/if}
</section>
