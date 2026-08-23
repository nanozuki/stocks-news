import { describe, expect, it } from 'vitest';
import { OpenAI } from './openai';

function createOpenAI(): OpenAI {
	const apiKey = process.env.OPENAI_API_KEY;
	expect(apiKey, 'OPENAI_API_KEY must be set to run the OpenAI tests.').toBeTruthy();
	return new OpenAI(apiKey!);
}

describe('OpenAI', () => {
	it('resolves an exact company query through the real Responses API', async () => {
		const result = await createOpenAI().searchStock('Apple Inc. NASDAQ stock');

		expect(result.candidates.length).toBeGreaterThan(0);
		expect(result.candidates.length).toBeLessThanOrEqual(5);
		expect(result.candidates).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					name: expect.any(String),
					symbol: 'AAPL',
					exchange: expect.any(String),
					country: expect.any(String),
					confidence: expect.any(Number)
				})
			])
		);
	}, 120_000);

	it('produces a validated seven-day summary through the real Responses API', async () => {
		const result = await createOpenAI().summaryNewsForStock({
			name: 'Apple Inc.',
			symbol: 'AAPL',
			exchange: 'NASDAQ'
		});

		expect(Date.parse(result.periodEnd) - Date.parse(result.periodStart)).toBe(
			7 * 24 * 60 * 60 * 1000
		);
		expect(result.searchedAt).toBe(result.periodEnd);
		expect(result.sources.length).toBeLessThanOrEqual(10);

		const sourceUrls = new Set(result.sources.map(({ url }) => url));
		for (const link of result.summaryMarkdown.matchAll(/\]\((https?:\/\/[^)]+)\)/g)) {
			expect(sourceUrls.has(link[1])).toBe(true);
		}
	}, 120_000);
});
