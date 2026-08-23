<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head><title>{page.status} | Stock News</title></svelte:head>

<div class="mx-auto max-w-xl py-20 text-center">
	<p class="mb-3 font-mono text-sm font-bold tracking-widest text-secondary">{page.status}</p>
	<h1 class="mb-4 text-4xl font-semibold tracking-tight">That ticker went missing.</h1>
	<p class="mb-8 text-base-content/60">
		{page.error?.message ?? 'The page you requested could not be found.'}
	</p>
	<a class="btn btn-primary" href="/">Return to your portfolio</a>
</div>
