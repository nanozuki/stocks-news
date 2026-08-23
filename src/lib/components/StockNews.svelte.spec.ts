import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import StockNews from './StockNews.svelte';

const news = {
	summaryMarkdown: 'Apple released an update.',
	sources: [
		{
			title: 'Apple releases an update',
			url: 'https://example.com/apple-update',
			publisher: 'example.com',
			publishedAt: null
		}
	],
	periodStart: '2026-03-14T12:00:00.000Z',
	periodEnd: '2026-03-21T12:00:00.000Z',
	searchedAt: '2026-03-21T12:00:00.000Z'
};

describe('StockNews.svelte', () => {
	it('requests a fresh summary from the refresh button', async () => {
		const onrefresh = vi.fn();
		render(StockNews, { news, refreshing: false, onrefresh });

		await page.getByRole('button', { name: 'Refresh news' }).click();

		expect(onrefresh).toHaveBeenCalledOnce();
	});

	it('numbers sources to match inline citations', async () => {
		render(StockNews, { news, refreshing: false, onrefresh: vi.fn() });

		await expect
			.element(page.getByRole('link', { name: 'Apple releases an update ↗' }))
			.toBeVisible();
		await expect.element(page.getByText('1', { exact: true })).toBeVisible();
	});

	it('disables the refresh button while a summary is loading', async () => {
		render(StockNews, { news, refreshing: true, onrefresh: vi.fn() });

		await expect.element(page.getByRole('button', { name: 'Refreshing news' })).toBeDisabled();
	});
});
