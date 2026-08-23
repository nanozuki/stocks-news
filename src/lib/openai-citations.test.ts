import { describe, expect, it } from 'vitest';
import { newsFromOpenAIText, type OpenAITextWithCitations } from './openai';

const url = 'https://example.com/nvidia-results';

function citedText(text: string, citationText: string): OpenAITextWithCitations {
	const startIndex = text.indexOf(citationText);
	return {
		text,
		annotations: [
			{
				type: 'url_citation',
				start_index: startIndex,
				end_index: startIndex + citationText.length,
				title: 'Nvidia reports quarterly results',
				url
			}
		]
	};
}

describe('newsFromOpenAIText', () => {
	it('builds links and sources from native OpenAI URL citations', () => {
		const result = newsFromOpenAIText([
			citedText('Nvidia reported results. 【citation】', '【citation】')
		]);

		expect(result.summaryMarkdown).toBe(`Nvidia reported results. [\\[1\\]](${url})`);
		expect(result.sources).toEqual([
			{
				title: 'Nvidia reports quarterly results',
				url,
				publisher: 'example.com',
				publishedAt: null
			}
		]);
	});

	it('uses one source number when OpenAI cites the same URL more than once', () => {
		const first = citedText('First claim. 【one】', '【one】');
		const second = citedText('Second claim. 【two】', '【two】');

		const result = newsFromOpenAIText([first, second]);

		expect(result.summaryMarkdown).toBe(
			`First claim. [\\[1\\]](${url})\n\nSecond claim. [\\[1\\]](${url})`
		);
		expect(result.sources).toHaveLength(1);
	});
});
