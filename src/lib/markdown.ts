import MarkdownIt from 'markdown-it';

/** Renders Markdown with raw HTML disabled and links restricted to returned news sources. */
export function renderNewsMarkdown(markdown: string, sourceUrls: readonly string[]): string {
	const allowedUrls = new Set(sourceUrls);
	const parser = new MarkdownIt({
		html: false,
		linkify: false,
		typographer: false
	});

	parser.validateLink = (url) => /^https?:\/\//i.test(url) && allowedUrls.has(url);
	parser.renderer.rules.link_open = (tokens, index, options, _env, renderer) => {
		const token = tokens[index];
		token.attrSet('rel', 'noopener noreferrer');
		token.attrSet('target', '_blank');
		return renderer.renderToken(tokens, index, options);
	};

	return parser.render(markdown);
}
