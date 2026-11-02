import '@testing-library/jest-dom/vitest';
import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { renderMarkdownWithMath, normalizeMathInner } from '../preview/markdownRenderer';
import { LivePreview } from '../preview/LivePreview';
import { EditorPage } from '../pages/EditorPage';
import { DEFAULT_DOCUMENT_SETTINGS, createNewDocument, saveDocument, setActiveDocId } from '../services/db';

describe('LaTeX Mathematical Equation Rendering Tests', () => {
  const defaultMeta = {
    title: 'Math Test Document',
    author: 'Tester',
    subtitle: '',
    date: '2026',
    abstract: '',
  };

  /**
   * 1. Inline equations: $ ... $ and \( ... \) and \\( ... \\)
   */
  it('renders inline equations with $, \\(...\\), and double-escaped \\\\(...\\\\)', () => {
    const md = 'Here is $E = mc^2$ and here is \\(a^2 + b^2 = c^2\\) and double \\\\(\\hbar = \\frac{h}{2\\pi}\\\\).';
    const html = renderMarkdownWithMath(md);

    expect(html).toContain('class="katex"');
    expect(html).toContain('class="katex-inline-wrapper"');
    // Ensure raw delimiters were not printed literally
    expect(html).not.toContain('\\(a^2');
    expect(html).not.toContain('\\\\(\\hbar');
  });

  /**
   * 2. Display equations: $$ ... $$ and \[ ... \] and \\[ ... \\]
   */
  it('renders display equations with $$, \\[...\\], and double-escaped \\\\[...\\\\]', () => {
    const md = `
$$
\\int_0^T x(t)y(t)\\,dt = 0
$$

\\[
\\Delta f = \\frac{k}{(m-n)T_s}
\\]

\\\\[
E^2 = (m_0 c^2)^2 + (\\mathbf{p}c)^2
\\\\]
`;
    const html = renderMarkdownWithMath(md);

    expect(html).toContain('class="katex-display"');
    expect(html).toContain('katex-display-wrapper');
    // Raw delimiters must be consumed and replaced
    expect(html).not.toContain('\\[\n\\Delta');
    expect(html).not.toContain('\\\\\[');
    expect(html).not.toContain('\\]');
  });

  /**
   * 3. Fractions, Integrals, Summations, and Square Roots
   */
  it('renders advanced mathematical constructs accurately (fractions, integrals, summations, roots)', () => {
    const md = '\\[ x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} \\quad \\sum_{n=1}^\\infty \\frac{1}{n^2} = \\frac{\\pi^2}{6} \\]';
    const html = renderMarkdownWithMath(md);

    expect(html).toContain('class="katex-display"');
    expect(html).toContain('sqrt');
    expect(html).toContain('frac');
  });

  /**
   * 4. Matrices and preservation of \\ row break
   */
  it('renders matrices and preserves double-backslashes (\\\\) as row delimiters', () => {
    const md = `
\\[
\\begin{pmatrix}
1 & 0 \\\\
0 & 1
\\end{pmatrix}
\\]
`;
    const html = renderMarkdownWithMath(md);

    expect(html).toContain('class="katex"');
    expect(html).toContain('matrix');
    // Double backslash should not cause KaTeX failure
    expect(html).not.toContain('katex-error');
  });

  /**
   * 5. Aligned equations and Cases
   */
  it('renders aligned equations and cases environments', () => {
    const md = `
\\[
\\begin{aligned}
\\nabla \\cdot \\mathbf{E} &= \\frac{\\rho}{\\varepsilon_0} \\\\
\\nabla \\cdot \\mathbf{B} &= 0
\\end{aligned}
\\]

\\[
f(x) = \\begin{cases}
x^2 & \\text{if } x \\ge 0 \\\\
-x & \\text{if } x < 0
\\end{cases}
\\]
`;
    const html = renderMarkdownWithMath(md);

    expect(html).toContain('class="katex-display"');
    expect(html).not.toContain('katex-error');
  });

  /**
   * 6. Greek letters and Boxed equations
   */
  it('renders Greek letters and boxed formulas', () => {
    const md = 'Greek $\\alpha, \\beta, \\gamma, \\Delta, \\Omega$ and boxed: \\[ \\boxed{e^{i\\pi} + 1 = 0} \\]';
    const html = renderMarkdownWithMath(md);

    expect(html).toContain('class="katex"');
    expect(html).toContain('boxed');
    expect(html).not.toContain('katex-error');
  });

  /**
   * 7. Multiple equations in sequence
   */
  it('renders multiple consecutive equations without interference', () => {
    const md = `
\\[
E = mc^2
\\]
\\[
F = ma
\\]
\\[
V = IR
\\]
`;
    const html = renderMarkdownWithMath(md);
    const count = (html.match(/class="katex-display-wrapper/g) || []).length;
    expect(count).toBe(3);
  });

  /**
   * 8. Equations mixed with normal paragraphs
   */
  it('renders equations embedded seamlessly within normal paragraphs without broken HTML nesting', () => {
    const md = `
The relativistic interval is defined by Minkowski as:

\\[
ds^2 = -c^2 dt^2 + dx^2 + dy^2 + dz^2
\\]

This equation preserves lorentz invariance across all inertial reference frames.
`;
    const html = renderMarkdownWithMath(md);

    expect(html).toContain('<p>The relativistic interval is defined by Minkowski as:</p>');
    expect(html).toContain('class="katex-display-wrapper');
    expect(html).toContain('<p>This equation preserves lorentz invariance across all inertial reference frames.</p>');
    // Ensure display div is not illegally nested inside <p>
    expect(html).not.toMatch(/<p>\s*<div class="katex-display-wrapper/);
  });

  /**
   * 9. LaTeX inside code blocks remains raw and untouched
   */
  it('never parses LaTeX-like syntax inside fenced code blocks or inline code', () => {
    const md = `
Here is a raw LaTeX code block:
\`\`\`latex
\\[
\\Delta f = \\frac{k}{(m-n)T_s}
\\]
\`\`\`

And inline code: \`\\[ x \\]\` or \`$E = mc^2$\`.
`;
    const html = renderMarkdownWithMath(md);

    // Code blocks must contain the raw literal strings unchanged
    expect(html).toContain('\\[\n\\Delta f = \\frac{k}{(m-n)T_s}\n\\]');
    expect(html).toContain('<code>\\[ x \\]</code>');
    expect(html).toContain('<code>$E = mc^2$</code>');
    // None of the code block or inline code content should be parsed into KaTeX
    expect(html).not.toContain('<span class="katex">');
  });

  /**
   * 10. Error handling for invalid equations
   */
  it('displays user-friendly error indicator and preserves original source on syntax errors without crashing', () => {
    const md = '\\[ \\frac{numerator_without_denominator}{ \\]';
    const html = renderMarkdownWithMath(md);

    expect(html).toContain('class="katex-error');
    expect(html).toContain('LaTeX Parse Error');
    expect(html).toContain('\\frac{numerator_without_denominator}{');
  });

  /**
   * 11. LivePreview component integration test
   */
  it('renders rendered mathematics inside the LivePreview React component', () => {
    const md = `
# Quantum Mechanics

The time-dependent Schrödinger equation is:

\\[
i\\hbar \\frac{\\partial}{\\partial t} |\\psi(t)\\rangle = \\hat{H} |\\psi(t)\\rangle
\\]
`;
    const { container } = render(
      <LivePreview
        markdown={md}
        metadata={defaultMeta}
        settings={DEFAULT_DOCUMENT_SETTINGS}
      />
    );

    // KaTeX elements should be present in the DOM
    const katexEl = container.querySelector('.katex-display');
    expect(katexEl).toBeInTheDocument();
  });

  /**
   * 12. Dynamic editing in EditorPage updates math preview and document switching preserves math
   */
  it('updates mathematical equations dynamically when edited and retains math when switching documents', async () => {
    const doc1 = createNewDocument('Doc Math 1', '# Math 1\n\n\\[ \\alpha = 42 \\]');
    const doc2 = createNewDocument('Doc Math 2', '# Math 2\n\n\\[ \\beta = 99 \\]');
    await saveDocument(doc1);
    await saveDocument(doc2);
    setActiveDocId(doc1.id);

    const { container } = render(
      <EditorPage
        isDarkMode={false}
        onToggleTheme={() => {}}
        onGoHome={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByTitle('Click to rename document')).toHaveTextContent('Doc Math 1');
      expect(container.querySelector('.katex')).toBeInTheDocument();
    });

    // Switch to Doc Math 2
    const doc2Buttons = screen.getAllByText('Doc Math 2');
    const sidebarDoc2 = doc2Buttons[doc2Buttons.length - 1];
    await act(async () => {
      fireEvent.click(sidebarDoc2);
    });

    await waitFor(() => {
      expect(screen.getByTitle('Click to rename document')).toHaveTextContent('Doc Math 2');
      // Verify KaTeX is present for Doc Math 2
      expect(container.querySelector('.katex')).toBeInTheDocument();
    });

    // Switch back to Doc Math 1
    const doc1Buttons = screen.getAllByText('Doc Math 1');
    const sidebarDoc1 = doc1Buttons[doc1Buttons.length - 1];
    await act(async () => {
      fireEvent.click(sidebarDoc1);
    });

    await waitFor(() => {
      expect(screen.getByTitle('Click to rename document')).toHaveTextContent('Doc Math 1');
      expect(container.querySelector('.katex')).toBeInTheDocument();
    });
  });

  /**
   * 13. Regression: Convolution and multiplication equations (exact equation from bug report)
   * Ensures:
   * - Display math delimiters \[...\] and double-escaped \\[...\\] are parsed correctly
   * - Escaped asterisk \* is normalized to \ast so KaTeX does not report "Undefined control sequence: \*"
   * - Multiplication with regular * and \ast and \cdot renders properly
   * - Backslashes are not incorrectly escaped or stripped
   * - LivePreview renders without any .katex-error
   */
  it('renders convolution equation with exact markdown \\[ y_j(t)=r(t)*h_j(t) \\] and \\[ y_j(t)=r(t)\\*h_j(t) \\]', () => {
    // Exact equation from user report with unescaped asterisk
    const md1 = '\\[ y_j(t)=r(t)*h_j(t) \\]';
    const html1 = renderMarkdownWithMath(md1);
    expect(html1).toContain('class="katex-display"');
    expect(html1).not.toContain('katex-error');
    expect(html1).not.toContain('\\[ y_j');

    // Exact equation from screenshot with escaped asterisk
    const md2 = '\\[ y_j(t)=r(t)\\*h_j(t) \\]';
    const html2 = renderMarkdownWithMath(md2);
    expect(html2).toContain('class="katex-display"');
    expect(html2).not.toContain('katex-error');
    expect(html2).not.toContain('Undefined control sequence');
    expect(html2).not.toContain('\\[ y_j');

    // Single-backslash display delimiters
    const md3 = '\\[ y_j(t)=r(t)*h_j(t) \\]';
    const html3 = renderMarkdownWithMath(md3);
    expect(html3).toContain('class="katex-display"');
    expect(html3).not.toContain('katex-error');

    const md4 = '\\[ y_j(t)=r(t)\\*h_j(t) \\]';
    const html4 = renderMarkdownWithMath(md4);
    expect(html4).toContain('class="katex-display"');
    expect(html4).not.toContain('katex-error');

    // Inline math with escaped asterisk
    const md5 = 'The convolution is $y_j(t)=r(t)\\*h_j(t)$ and \\(y_j(t)=r(t)\\*h_j(t)\\).';
    const html5 = renderMarkdownWithMath(md5);
    expect(html5).toContain('class="katex"');
    expect(html5).not.toContain('katex-error');
  });

  it('normalizes math inner characters correctly (braces, pipes, asterisks, double commands)', () => {
    expect(normalizeMathInner('y_j(t)=r(t)\\*h_j(t)')).toBe('y_j(t)=r(t)\\ast h_j(t)');
    expect(normalizeMathInner('y_j(t)=r(t)*h_j(t)')).toBe('y_j(t)=r(t)*h_j(t)');
    expect(normalizeMathInner('y_j(t)=r(t) \\* h_j(t)')).toBe('y_j(t)=r(t) \\ast h_j(t)');
    expect(normalizeMathInner('\\\\{s_1, -s_1\\\\}')).toBe('\\{s_1, -s_1\\}');
    expect(normalizeMathInner('\\\\|\\mathbf{w}\\\\|_2^2')).toBe('\\|\\mathbf{w}\\|_2^2');
    expect(normalizeMathInner('\\\\alpha + \\\\beta')).toBe('\\alpha + \\beta');
    expect(normalizeMathInner('A^{\\*} = B')).toBe('A^{\\ast} = B');
    expect(normalizeMathInner('r_j=\\int_0^T r(t)\\phi_j(t)\\\\,dt')).toBe('r_j=\\int_0^T r(t)\\phi_j(t)\\,dt');
    expect(normalizeMathInner('x\\\\;y\\\\:z\\\\!w')).toBe('x\\;y\\:z\\!w');
  });

  it('renders integral with double-escaped thin space \\\\, on single line without line break', () => {
    const md = '$$ r_j=\\int_0^T r(t)\\phi_j(t)\\\\,dt $$';
    const html = renderMarkdownWithMath(md);
    expect(html).toContain('class="katex-display"');
    expect(html).not.toContain('katex-error');
    // Ensure KaTeX receives \,dt not \\,dt so it doesn't break into two lines
    expect(html).toContain('r_j=\\int_0^T r(t)\\phi_j(t)\\,dt');
  });

  it('renders convolution equations inside LivePreview component without KaTeX parse error', async () => {
    const markdown = `
## 4. How does the matched filter produce the correlator output?

This is the most important mathematical part of this section.

Remember the convolution equation:

\\[ y_j(t)=r(t)*h_j(t) \\]

And with markdown escaped asterisk:

\\[ y_j(t)=r(t)\\*h_j(t) \\]

And with correlator integral equation with double-escaped thin space:

$$ r_j=\\int_0^T r(t)\\phi_j(t)\\\\,dt $$
`;
    const { container } = render(
      <LivePreview
        markdown={markdown}
        metadata={defaultMeta}
        settings={DEFAULT_DOCUMENT_SETTINGS}
      />
    );

    // Ensure no KaTeX parse error banner is rendered
    expect(container.querySelector('.katex-error')).toBeNull();

    // Ensure display equations are rendered
    const displayElements = container.querySelectorAll('.katex-display');
    expect(displayElements.length).toBe(3);
  });
});
