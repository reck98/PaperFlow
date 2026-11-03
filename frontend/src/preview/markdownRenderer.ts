import { marked } from 'marked';
import katex from 'katex';
import { OutlineItem } from '../types';

export function extractOutline(markdown: string): OutlineItem[] {
  if (!markdown) return [];

  const lines = markdown.split('\n');
  const outline: OutlineItem[] = [];
  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('```') || trimmed.startsWith('~~~')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }

    if (inCodeBlock) continue;

    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const rawText = match[2].trim();
      // Strip markdown formatting symbols but preserve readable text
      const plainText = rawText
        .replace(/[*_`]/g, '')
        .replace(/\\+\[|\\+\]|\\+\(|\\+\)/g, '')
        .trim();
      const id = plainText
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      outline.push({
        id: id || `heading-${i + 1}`,
        text: plainText || rawText,
        level,
        line: i + 1,
      });
    }
  }

  return outline;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderKaTeX(tex: string, displayMode: boolean): string {
  const trimmed = tex.trim();
  try {
    return katex.renderToString(trimmed, {
      displayMode,
      throwOnError: true,
      strict: false,
    });
  } catch (err: any) {
    const errorMsg = err?.message || 'Invalid LaTeX mathematical expression';
    if (displayMode) {
      return `
        <div class="katex-error my-3 p-3 rounded bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/60 text-red-600 dark:text-red-400 font-mono text-xs text-left not-prose">
          <div class="font-semibold text-[11px] mb-1.5 flex items-center space-x-1.5 text-red-700 dark:text-red-300">
            <span>⚠️ LaTeX Parse Error:</span>
            <span class="font-normal opacity-90">${escapeHtml(errorMsg)}</span>
          </div>
          <code class="block text-[11px] bg-red-100/70 dark:bg-red-900/40 p-2 rounded overflow-x-auto text-red-900 dark:text-red-200 whitespace-pre">${escapeHtml(trimmed)}</code>
        </div>
      `;
    }
    return `
      <span class="katex-error inline-block px-1.5 py-0.5 rounded bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/60 text-red-600 dark:text-red-400 font-mono text-xs" title="${escapeHtml(errorMsg)}">
        ⚠️ <span class="font-semibold">[LaTeX Error]</span>: <code class="text-[11px]">${escapeHtml(trimmed)}</code>
      </span>
    `;
  }
}

export function normalizeMathInner(inner: string): string {
  return inner
    // 1. Double-escaped braces for sets: \\{ -> \{ and \\} -> \}
    .replace(/\\{2,}\{/g, '\\{')
    .replace(/\\{2,}\}/g, '\\}')
    // 2. Double-escaped pipe: \\| -> \|
    .replace(/\\{2,}\|/g, '\\|')
    // 3. Double-escaped row breaks: \\\\ before newline, space, or end of environment -> \\
    .replace(/\\\\\\\\(?=\s*(?:\r?\n|&|\\end|$))/g, '\\\\')
    // 4. Double-escaped LaTeX commands: \\alpha -> \alpha, \\sum -> \sum, \\vec -> \vec, \\boxed -> \boxed, etc.
    .replace(/\\{2,}([a-zA-Z]+)/g, '\\$1')
    // 5. Double-escaped math spacing operators: \\, -> \, and \\: -> \: and \\; -> \; and \\! -> \!
    .replace(/\\{2,}([,;:!])/g, '\\$1')
    // 6. Escaped asterisks from Markdown (\* or \\*): in LaTeX math, \* is undefined; replace with \ast
    .replace(/\\+\*(?=[a-zA-Z])/g, '\\ast ')
    .replace(/\\+\*/g, '\\ast')
    // 7. Collapse internal blank lines which cause Pandoc's TeX math parser to abort
    .replace(/\r?\n\s*\r?\n/g, '\n');
}

export function renderMarkdownWithMath(markdown: string): string {
  if (!markdown) return '';

  const mathPlaceholders: { placeholder: string; rendered: string }[] = [];
  let placeholderCounter = 0;

  // 1. Protect code blocks (fenced ``` and ~~~, and inline `...`)
  const codeBlocks: { placeholder: string; original: string }[] = [];
  let text = markdown.replace(/(```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]+`)/g, (match) => {
    const placeholder = `PAPERFLOWCODEBLOCK${codeBlocks.length}END`;
    codeBlocks.push({ placeholder, original: match });
    return placeholder;
  });

  // 2. Safe normalization of unambiguous double-escaped outer delimiters outside code blocks
  // e.g., \\[ ... \\] -> \[ ... \] and \\( ... \\) -> \( ... \)
  // Does NOT replace internal double-backslashes (like LaTeX row breaks \\)
  text = text.replace(/\\\\\[([\s\S]*?)\\\\\]/g, (_m, inner) => `\\[${inner}\\]`);
  text = text.replace(/\\\\\(([\s\S]*?)\\\\\)/g, (_m, inner) => `\\(${inner}\\)`);

  // 3. Extract display mathematics:
  // a) $$ ... $$
  text = text.replace(/\$\$([\s\S]*?)\$\$/g, (_match, math) => {
    const placeholder = `PAPERFLOWMATHBLOCK${placeholderCounter++}END`;
    const rendered = `<div class="katex-display-wrapper my-4 overflow-x-auto text-center">${renderKaTeX(normalizeMathInner(math), true)}</div>`;
    mathPlaceholders.push({ placeholder, rendered });
    return `\n\n${placeholder}\n\n`;
  });

  // b) Standard LaTeX display delimiters: \[ ... \]
  text = text.replace(/\\\[([\s\S]*?)\\\]/g, (_match, math) => {
    const placeholder = `PAPERFLOWMATHBLOCK${placeholderCounter++}END`;
    const rendered = `<div class="katex-display-wrapper my-4 overflow-x-auto text-center">${renderKaTeX(normalizeMathInner(math), true)}</div>`;
    mathPlaceholders.push({ placeholder, rendered });
    return `\n\n${placeholder}\n\n`;
  });

  // c) Standalone LaTeX environments: \begin{aligned|matrix|cases|gather|align*...} ... \end{...}
  text = text.replace(
    /(?:^|[^\$\\])(\\begin\{(?:matrix|pmatrix|bmatrix|Bmatrix|vmatrix|Vmatrix|aligned|alignedat|gathered|align\*?|gather\*?|cases|dcases|rcases|equation\*?)\}[\s\S]*?\\end\{(?:matrix|pmatrix|bmatrix|Bmatrix|vmatrix|Vmatrix|aligned|alignedat|gathered|align\*?|gather\*?|cases|dcases|rcases|equation\*?)\})/g,
    (match, math) => {
      const placeholder = `PAPERFLOWMATHBLOCK${placeholderCounter++}END`;
      const rendered = `<div class="katex-display-wrapper my-4 overflow-x-auto text-center">${renderKaTeX(normalizeMathInner(math), true)}</div>`;
      mathPlaceholders.push({ placeholder, rendered });
      const prefix = match.startsWith(math) ? '' : match.substring(0, match.length - math.length);
      return `${prefix}\n\n${placeholder}\n\n`;
    }
  );

  // 4. Extract inline mathematics:
  // a) Standard LaTeX inline delimiters: \( ... \)
  text = text.replace(/\\\(([\s\S]*?)\\\)/g, (_match, math) => {
    const placeholder = `PAPERFLOWMATHINLINE${placeholderCounter++}END`;
    const rendered = `<span class="katex-inline-wrapper">${renderKaTeX(normalizeMathInner(math), false)}</span>`;
    mathPlaceholders.push({ placeholder, rendered });
    return placeholder;
  });

  // b) Standard inline math with $ ... $:
  // Negative lookbehind/lookahead ensures escaped \$ is ignored and opening/closing spacing rules are respected
  text = text.replace(/(?<!\\)\$(?!\s)([^\$\n]+?)(?<!\s)(?<!\\)\$/g, (_match, math) => {
    const placeholder = `PAPERFLOWMATHINLINE${placeholderCounter++}END`;
    const rendered = `<span class="katex-inline-wrapper">${renderKaTeX(normalizeMathInner(math), false)}</span>`;
    mathPlaceholders.push({ placeholder, rendered });
    return placeholder;
  });

  // 5. Restore protected code blocks so marked can parse them into standard pre/code tags
  for (const item of codeBlocks) {
    text = text.replace(item.placeholder, () => item.original);
  }

  // 6. Custom marked renderer for headings (with auto IDs), tables, blockquotes, code, and links
  const renderer = new marked.Renderer();

  renderer.heading = function ({ tokens, depth }) {
    const headingText = tokens && tokens.length > 0 ? this.parser.parseInline(tokens) : '';
    const plainText = headingText.replace(/<[^>]*>/g, '').trim();
    const id = plainText
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const sizeClasses = [
      'text-2xl sm:text-3xl font-semibold mt-8 mb-4 border-b border-gray-200 dark:border-gray-800 pb-2',
      'text-xl sm:text-2xl font-semibold mt-6 mb-3',
      'text-lg sm:text-xl font-medium mt-5 mb-2',
      'text-base sm:text-lg font-medium mt-4 mb-2',
      'text-sm sm:text-base font-medium mt-3 mb-1',
      'text-xs sm:text-sm font-medium mt-2 mb-1',
    ];
    const sizeClass = sizeClasses[depth - 1] || sizeClasses[sizeClasses.length - 1];

    return `<h${depth} id="${id}" class="${sizeClass} scroll-mt-20 group relative">${headingText}</h${depth}>`;
  };

  renderer.table = function (token) {
    const headerHtml = token.header
      .map(
        (cell) =>
          `<th class="px-4 py-2 text-left font-semibold border-b-2 border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40 text-xs">${
            cell.tokens ? this.parser.parseInline(cell.tokens) : escapeHtml(cell.text || '')
          }</th>`
      )
      .join('');
    const rowsHtml = token.rows
      .map((row) => {
        const cells = row
          .map(
            (cell) =>
              `<td class="px-4 py-2 border-b border-gray-200 dark:border-gray-800 text-sm">${
                cell.tokens ? this.parser.parseInline(cell.tokens) : escapeHtml(cell.text || '')
              }</td>`
          )
          .join('');
        return `<tr class="hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors">${cells}</tr>`;
      })
      .join('');

    return `
      <div class="my-6 overflow-x-auto rounded-sm border border-gray-200 dark:border-gray-800">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-800 font-sans">
          <thead><tr>${headerHtml}</tr></thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </div>
    `;
  };

  renderer.blockquote = function ({ tokens, text }) {
    const body = tokens && tokens.length > 0 ? this.parser.parse(tokens) : (text ? escapeHtml(text) : '');
    return `<blockquote class="my-5 border-l-4 border-amber-600/70 dark:border-amber-500 pl-4 py-1 italic text-gray-700 dark:text-gray-300 bg-amber-50/20 dark:bg-amber-950/10 rounded-r">${body}</blockquote>`;
  };

  renderer.code = function ({ text: code, lang }) {
    const language = lang || 'text';
    return `
      <div class="my-5 rounded-md overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-900 text-gray-100 font-mono text-xs max-w-full">
        <div class="flex items-center justify-between px-3.5 py-1.5 bg-gray-800/90 border-b border-gray-700/60 text-gray-400 select-none">
          <span class="text-[11px] font-medium tracking-wide lowercase">${escapeHtml(language)}</span>
        </div>
        <pre class="p-4 overflow-x-auto leading-relaxed max-w-full"><code>${escapeHtml(code)}</code></pre>
      </div>
    `;
  };

  renderer.image = function ({ href, title, text }) {
    const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
    const altAttr = text ? ` alt="${escapeHtml(text)}"` : ' alt="Document Image"';
    return `
      <figure class="my-6 max-w-full text-center">
        <img src="${escapeHtml(href)}" class="max-w-full h-auto rounded shadow-sm mx-auto"${altAttr}${titleAttr} loading="lazy" />
        ${text ? `<figcaption class="mt-2 text-center text-xs text-gray-500 dark:text-gray-400 font-sans italic">${escapeHtml(text)}</figcaption>` : ''}
      </figure>
    `;
  };

  renderer.link = function ({ href, title, tokens, text }) {
    const linkText = tokens && tokens.length > 0 ? this.parser.parseInline(tokens) : escapeHtml(text || href || '');
    const cleanHref = href ? escapeHtml(href) : '';
    const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
    return `<a href="${cleanHref}" class="text-amber-700 dark:text-amber-400 underline underline-offset-2 break-words hover:text-amber-800 dark:hover:text-amber-300 transition-colors"${titleAttr} target="_blank" rel="noopener noreferrer">${linkText}</a>`;
  };

  marked.setOptions({
    gfm: true,
    breaks: false,
    renderer,
  });

  // 7. Parse Markdown into HTML
  let html = marked.parse(text) as string;

  // 8. Restore rendered KaTeX math placeholders
  // If a block math placeholder was wrapped in <p>...</p>, replace the entire paragraph to keep HTML valid
  for (const item of mathPlaceholders) {
    const pRegex = new RegExp(`<p>\\s*${item.placeholder}\\s*<\\/p>`, 'g');
    if (html.match(pRegex)) {
      html = html.replace(pRegex, () => item.rendered);
    } else {
      html = html.replace(item.placeholder, () => item.rendered);
    }
  }

  return html;
}
