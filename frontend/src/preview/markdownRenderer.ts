import { marked } from 'marked';
import katex from 'katex';
import { OutlineItem } from '../types';

export function extractOutline(markdown: string): OutlineItem[] {
  const lines = markdown.split('\n');
  const outline: OutlineItem[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim().replace(/[*_`]/g, '');
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      outline.push({
        id,
        text,
        level,
        line: i + 1,
      });
    }
  }

  return outline;
}

export function renderMarkdownWithMath(markdown: string): string {
  if (!markdown) return '';

  const mathPlaceholders: { placeholder: string; rendered: string }[] = [];
  let placeholderCounter = 0;

  // 1. Protect code blocks so math symbols inside code blocks are untouched
  const codeBlocks: { placeholder: string; original: string }[] = [];
  let text = markdown.replace(/(```[\s\S]*?```|`[^`\n]+`)/g, (match) => {
    const placeholder = `%%CODE_BLOCK_${codeBlocks.length}%%`;
    codeBlocks.push({ placeholder, original: match });
    return placeholder;
  });

  // 2. Extract and render display math: $$ ... $$
  text = text.replace(/\$\$([\s\S]*?)\$\$/g, (_match, math) => {
    const placeholder = `%%MATH_DISPLAY_${placeholderCounter++}%%`;
    let rendered = '';
    try {
      rendered = katex.renderToString(math.trim(), {
        displayMode: true,
        throwOnError: false,
        strict: false,
      });
    } catch (err: any) {
      rendered = `<div class="katex-error text-red-500 font-mono text-xs my-2 p-2 bg-red-50 dark:bg-red-950/30 rounded">${escapeHtml(err.message)}</div>`;
    }
    mathPlaceholders.push({ placeholder, rendered: `<div class="my-4 overflow-x-auto">${rendered}</div>` });
    return placeholder;
  });

  // 3. Extract and render LaTeX environments: \begin{aligned|matrix|cases|gather}...\end{...}
  text = text.replace(/(\\begin\{(?:matrix|pmatrix|bmatrix|vmatrix|aligned|align\*?|gather\*?|cases)\}[\s\S]*?\\end\{(?:matrix|pmatrix|bmatrix|vmatrix|aligned|align\*?|gather\*?|cases)\})/g, (_match, math) => {
    const placeholder = `%%MATH_ENV_${placeholderCounter++}%%`;
    let rendered = '';
    try {
      rendered = katex.renderToString(math.trim(), {
        displayMode: true,
        throwOnError: false,
        strict: false,
      });
    } catch (err: any) {
      rendered = `<div class="katex-error text-red-500 font-mono text-xs my-2 p-2 bg-red-50 dark:bg-red-950/30 rounded">${escapeHtml(err.message)}</div>`;
    }
    mathPlaceholders.push({ placeholder, rendered: `<div class="my-4 overflow-x-auto">${rendered}</div>` });
    return placeholder;
  });

  // 4. Extract and render inline math: $ ... $
  // Note: negative lookbehind/lookahead to avoid matching literal \$ or empty $$
  text = text.replace(/(?<!\\)\$([^\$\n]+?)(?<!\\)\$/g, (_match, math) => {
    const placeholder = `%%MATH_INLINE_${placeholderCounter++}%%`;
    let rendered = '';
    try {
      rendered = katex.renderToString(math.trim(), {
        displayMode: false,
        throwOnError: false,
        strict: false,
      });
    } catch (err: any) {
      rendered = `<span class="katex-error text-red-500 font-mono text-xs">${escapeHtml(err.message)}</span>`;
    }
    mathPlaceholders.push({ placeholder, rendered });
    return placeholder;
  });

  // 5. Restore code blocks
  for (const item of codeBlocks) {
    text = text.replace(item.placeholder, item.original);
  }

  // 6. Custom marked renderer for headings (with auto IDs), tables, and blockquotes
  const renderer = new marked.Renderer();

  renderer.heading = ({ tokens, depth }) => {
    const headingText = marked.parseInline(tokens.map(t => t.raw).join('')) as string;
    const plainText = headingText.replace(/<[^>]*>/g, '').trim();
    const id = plainText.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
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

  renderer.table = (token) => {
    const headerHtml = token.header.map(cell => `<th class="px-4 py-2 text-left font-semibold border-b-2 border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40 text-xs">${marked.parseInline(cell.tokens.map(t => t.raw).join(''))}</th>`).join('');
    const rowsHtml = token.rows.map(row => {
      const cells = row.map(cell => `<td class="px-4 py-2 border-b border-gray-200 dark:border-gray-800 text-sm">${marked.parseInline(cell.tokens.map(t => t.raw).join(''))}</td>`).join('');
      return `<tr class="hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors">${cells}</tr>`;
    }).join('');

    return `
      <div class="my-6 overflow-x-auto rounded-sm border border-gray-200 dark:border-gray-800">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-800 font-sans">
          <thead><tr>${headerHtml}</tr></thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </div>
    `;
  };

  renderer.blockquote = ({ text: quoteText }) => {
    return `<blockquote class="my-5 border-l-4 border-amber-600/70 dark:border-amber-500 pl-4 py-1 italic text-gray-700 dark:text-gray-300 bg-amber-50/20 dark:bg-amber-950/10 rounded-r">${marked.parse(quoteText)}</blockquote>`;
  };

  renderer.code = ({ text: code, lang }) => {
    const language = lang || 'text';
    return `
      <div class="my-5 rounded-md overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-900 text-gray-100 font-mono text-xs">
        <div class="flex items-center justify-between px-3.5 py-1.5 bg-gray-800/90 border-b border-gray-700/60 text-gray-400 select-none">
          <span class="text-[11px] font-medium tracking-wide lowercase">${escapeHtml(language)}</span>
        </div>
        <pre class="p-4 overflow-x-auto leading-relaxed"><code>${escapeHtml(code)}</code></pre>
      </div>
    `;
  };

  marked.setOptions({
    gfm: true,
    breaks: false,
    renderer,
  });

  // 7. Parse Markdown into HTML
  let html = marked.parse(text) as string;

  // 8. Restore rendered KaTeX math placeholders
  for (const item of mathPlaceholders) {
    html = html.replace(item.placeholder, item.rendered);
  }

  return html;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
