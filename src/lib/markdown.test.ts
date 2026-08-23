import { describe, expect, it } from 'vitest';
import { renderNewsMarkdown } from './markdown';

describe('renderNewsMarkdown', () => {
	it('renders only links included in the source set', () => {
		const html = renderNewsMarkdown(
			'Read [the filing](https://example.com/filing) and [a bad link](javascript:alert(1)).',
			['https://example.com/filing']
		);

		expect(html).toContain(
			'<a href="https://example.com/filing" rel="noopener noreferrer" target="_blank">the filing</a>'
		);
		expect(html).not.toContain('<a href="javascript:');
		expect(html).toContain('a bad link');
	});

	it('renders a numeric citation with visible brackets', () => {
		const html = renderNewsMarkdown('Results improved. [1](https://example.com/results)', [
			'https://example.com/results'
		]);

		expect(html).toContain('>[1]</a>');
	});

	it('escapes raw HTML and renders standard Markdown blocks', () => {
		const html = renderNewsMarkdown(
			'<script>alert(1)</script>\n\n## Events\n\n- **Earnings** reported\n- Guidance updated',
			[]
		);

		expect(html).not.toContain('<script>');
		expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
		expect(html).toContain('<h2>Events</h2>');
		expect(html).toContain('<ul>');
		expect(html).toContain('<strong>Earnings</strong>');
	});
});
