import { beforeEach, describe, expect, it, vi } from 'vitest';

const { create, sdkConstructor } = vi.hoisted(() => {
	const create = vi.fn();
	const sdkConstructor = vi.fn(function () {
		return { responses: { create } };
	});
	return { create, sdkConstructor };
});

vi.mock('openai', () => ({ default: sdkConstructor }));

import { OpenAI } from './openai';

beforeEach(() => {
	create.mockReset();
	sdkConstructor.mockClear();
});

describe('OpenAI', () => {
	it('searches for at most five validated public-company candidates', async () => {
		create.mockResolvedValue({
			output_text: JSON.stringify({
				candidates: Array.from({ length: 6 }, (_, index) => ({
					name: `Company ${index}`,
					symbol: `SYM${index}`,
					exchange: 'NASDAQ',
					country: 'United States',
					confidence: 0.9
				}))
			})
		});

		const ai = new OpenAI('test-key');
		const result = await ai.searchStock('semiconductor company');

		expect(sdkConstructor).toHaveBeenCalledWith(
			expect.objectContaining({ apiKey: 'test-key', maxRetries: 2 })
		);
		expect(result.candidates).toHaveLength(5);
		expect(create).toHaveBeenCalledWith(
			expect.objectContaining({
				tools: [{ type: 'web_search' }],
				text: expect.objectContaining({
					format: expect.objectContaining({ type: 'json_schema', strict: true })
				})
			})
		);
	});

	it('uses an exact seven-day range and returns only cited source links', async () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-03-10T12:00:00.000Z'));
		create.mockResolvedValue({
			output_text: JSON.stringify({
				summaryMarkdown:
					'Apple announced an update.\n\nRead it [in its newsroom](https://example.com/apple-news?utm_source=openai).',
				sources: [
					{
						title: 'Apple update',
						url: 'https://example.com/apple-news',
						publisher: 'Example News',
						publishedAt: '2026-03-09T08:00:00.000Z'
					}
				]
			}).replace('\\n\\n', '\n\n')
		});

		const result = await new OpenAI('test-key').summaryNewsForStock('AAPL');

		expect(result.periodStart).toBe('2026-03-03T12:00:00.000Z');
		expect(result.periodEnd).toBe('2026-03-10T12:00:00.000Z');
		expect(result.searchedAt).toBe(result.periodEnd);
		expect(result.summaryMarkdown).toContain('](https://example.com/apple-news)');
		expect(create.mock.calls[0][0].input).toContain('2026-03-03T12:00:00.000Z');
		expect(create.mock.calls[0][0].input).toContain('2026-03-10T12:00:00.000Z');
		vi.useRealTimers();
	});

	it('rejects malformed model output', async () => {
		create.mockResolvedValue({ output_text: '{"candidates":[{"symbol":"AAPL"}]}' });

		await expect(new OpenAI('test-key').searchStock('Apple')).rejects.toThrow(
			'Invalid OpenAI stock-search response'
		);
	});
});
