import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderMarkdownWithMath } from '../preview/markdownRenderer';

describe('Marked Markdown Parser & Link Recursion Regression Suite', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error');
    consoleWarnSpy = vi.spyOn(console, 'warn');
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe('1. Production Bug Reproduction & Recursion Prevention', () => {
    it('does NOT trigger infinite recursion or stack overflow on bare URLs', () => {
      const input = 'Check out https://paperflow.dev for more information.';
      expect(() => {
        const html = renderMarkdownWithMath(input);
        expect(html).toContain('<a href="https://paperflow.dev"');
        expect(html).toContain('https://paperflow.dev</a>');
      }).not.toThrow();

      // Ensure marked "Please report this" error is never logged
      for (const call of consoleErrorSpy.mock.calls) {
        const msg = call.join(' ');
        expect(msg).not.toContain('Please report this to https://github.com/markedjs/marked');
        expect(msg).not.toContain('Maximum call stack size exceeded');
      }
    });

    it('handles multiple bare URLs and GFM autolinks without recursive parseInline calls', () => {
      const input = `
https://example.com
https://google.com
<https://github.com>
https://wikipedia.org/wiki/LaTeX
      `.trim();

      const html = renderMarkdownWithMath(input);
      expect(html).toContain('href="https://example.com"');
      expect(html).toContain('href="https://google.com"');
      expect(html).toContain('href="https://github.com"');
      expect(html).toContain('href="https://wikipedia.org/wiki/LaTeX"');

      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('renders consecutive and adjacent bare URLs properly', () => {
      const input = 'https://first.com https://second.com and (https://third.com).';
      const html = renderMarkdownWithMath(input);

      expect(html).toContain('href="https://first.com"');
      expect(html).toContain('href="https://second.com"');
      expect(html).toContain('href="https://third.com"');
      expect(html).not.toContain('Maximum call stack');
    });

    it('processes dense documents with dozens of URLs without any recursion errors', () => {
      const urls = Array.from({ length: 50 }, (_, i) => `Item ${i}: https://domain-${i}.com/path/${i}`).join('\n\n');
      const start = performance.now();
      const html = renderMarkdownWithMath(urls);
      const elapsed = performance.now() - start;

      expect(html).toContain('https://domain-0.com/path/0');
      expect(html).toContain('https://domain-49.com/path/49');
      // Should complete quickly without thousands of recursive frames
      expect(elapsed).toBeLessThan(1000);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe('2. Standard and Nested Markdown Links', () => {
    it('renders standard markdown links with custom styling and attributes', () => {
      const input = 'Visit [PaperFlow App](https://paperflow.dev) today!';
      const html = renderMarkdownWithMath(input);

      expect(html).toContain('href="https://paperflow.dev"');
      expect(html).toContain('target="_blank"');
      expect(html).toContain('rel="noopener noreferrer"');
      expect(html).toContain('text-amber-700');
      expect(html).toContain('PaperFlow App</a>');
    });

    it('renders links with title attributes correctly escaped', () => {
      const input = '[Hover Link](https://paperflow.dev "Awesome Title & Tooltip")';
      const html = renderMarkdownWithMath(input);

      expect(html).toContain('title="Awesome Title &amp; Tooltip"');
      expect(html).toContain('Hover Link</a>');
    });

    it('renders links with nested formatting (bold, italic, code)', () => {
      const input = '[**Bold text** and *italic text* and `inline code`](https://paperflow.dev)';
      const html = renderMarkdownWithMath(input);

      expect(html).toContain('<strong>Bold text</strong>');
      expect(html).toContain('<em>italic text</em>');
      expect(html).toContain('<code>inline code</code>');
      expect(html).toContain('href="https://paperflow.dev"');
    });

    it('handles empty text or empty href safely without throwing', () => {
      const input = '[](https://empty-label.com) and [No URL]() and [broken link';
      expect(() => {
        const html = renderMarkdownWithMath(input);
        expect(html).toBeDefined();
      }).not.toThrow();
    });
  });

  describe('3. Links Inside Containers (Headings, Blockquotes, Tables, Lists)', () => {
    it('renders links inside headings and generates appropriate ID', () => {
      const input = '# Chapter 1: [Research Gate](https://researchgate.net) and https://ieee.org';
      const html = renderMarkdownWithMath(input);

      expect(html).toContain('<h1');
      expect(html).toContain('href="https://researchgate.net"');
      expect(html).toContain('href="https://ieee.org"');
      expect(html).toContain('</h1>');
    });

    it('renders links inside blockquotes without re-lexing blockquote content', () => {
      const input = '> According to [Shannon 1948](https://bell-labs.com), channel capacity is bounded. See https://bell.com';
      const html = renderMarkdownWithMath(input);

      expect(html).toContain('<blockquote');
      expect(html).toContain('href="https://bell-labs.com"');
      expect(html).toContain('href="https://bell.com"');
      expect(html).toContain('</blockquote>');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('renders links and bare URLs inside markdown tables', () => {
      const input = `
| Tool | Website | Documentation |
| :--- | :--- | :--- |
| PaperFlow | https://paperflow.dev | [Docs](https://paperflow.dev/docs) |
| Typst | https://typst.app | [Guide](https://typst.app/docs) |
      `.trim();

      const html = renderMarkdownWithMath(input);
      expect(html).toContain('<table');
      expect(html).toContain('href="https://paperflow.dev"');
      expect(html).toContain('href="https://paperflow.dev/docs"');
      expect(html).toContain('href="https://typst.app"');
      expect(html).toContain('</table>');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('renders links inside nested ordered and unordered lists', () => {
      const input = `
* Top item
  * Sub-item with https://link-a.com
  * Sub-item with [Link B](https://link-b.com)
1. Numbered item with https://link-c.com
      `.trim();

      const html = renderMarkdownWithMath(input);
      expect(html).toContain('href="https://link-a.com"');
      expect(html).toContain('href="https://link-b.com"');
      expect(html).toContain('href="https://link-c.com"');
    });
  });

  describe('4. Math and LaTeX Delimiters Coexisting with Links', () => {
    it('renders LaTeX display equations alongside bare URLs and markdown links', () => {
      const input = `
## 4. Matched Filter Demodulation

Remember the convolution equation:

\\[ y_j(t)=r(t)*h_j(t) \\]

Refer to the official documentation at https://paperflow.dev and [Signal Processing](https://dsp.org).
      `.trim();

      const html = renderMarkdownWithMath(input);

      // LaTeX display math must be rendered via KaTeX
      expect(html).toContain('katex-display');
      expect(html).toContain('y_j(t)');

      // Links must be rendered cleanly
      expect(html).toContain('href="https://paperflow.dev"');
      expect(html).toContain('href="https://dsp.org"');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('renders inline math next to links without interference', () => {
      const input = 'The energy is $E = mc^2$ as described in [Einstein 1905](https://annalen-der-physik.org).';
      const html = renderMarkdownWithMath(input);

      expect(html).toContain('katex');
      expect(html).toContain('href="https://annalen-der-physik.org"');
    });

    it('does not re-parse URLs inside protected code blocks', () => {
      const input = `
Here is sample code:
\`\`\`javascript
const api = "https://api.example.com";
console.log(api);
\`\`\`
Visit https://live.example.com for live demo.
      `.trim();

      const html = renderMarkdownWithMath(input);

      // Code block content must remain literal inside <code> tag, NOT turned into <a>
      expect(html).toContain('&quot;https://api.example.com&quot;');
      expect(html).not.toContain('<a href="https://api.example.com"');

      // The URL outside code block MUST be a link
      expect(html).toContain('<a href="https://live.example.com"');
    });
  });
});
