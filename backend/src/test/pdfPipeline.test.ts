import fs from 'fs';
import os from 'os';
import path from 'path';
import { generatePdf, DEFAULT_SETTINGS, normalizeMathInner } from '../converters/pdfService.js';
import { checkBinaries } from '../utils/paths.js';
import { DocumentPreset, ExportPdfRequest } from '../types.js';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (!condition) {
    failedTests++;
    console.error(`  FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  passedTests++;
  console.log(`  PASS: ${message}`);
}

async function runTests() {
  console.log('\n======================================================');
  console.log('Paperflow PDF Pipeline & Typesetting Engine Test Suite');
  console.log('======================================================\n');

  // Test 1: Binary and writer validation
  console.log('--- Test 1: Startup Binary & Engine Health Check ---');
  const binaries = checkBinaries();
  assert(binaries.pandoc, `Pandoc binary detected at ${binaries.pandocPath}`);
  assert(binaries.pandocSupportsTypst, `Pandoc supports Typst output writer (version: ${binaries.pandocVersion})`);
  assert(binaries.typst, `Typst CLI binary detected at ${binaries.typstPath} (version: ${binaries.typstVersion})`);

  // Test 2: Complex mathematical equations (Carrier wave, Hadamard, Align, Cases)
  console.log('\n--- Test 2: Mathematical Equation Typesetting & Delimiters ---');
  const engineeringMarkdown = `
# Advanced Digital Communications & Signal Processing

Engineering notes on modulation, transform matrices, and field theory.

## 1. Frequency Shift Keying & Carrier Modulation

The modulated signal waveforms for $M$-ary orthogonal FSK are given by:

\\[
s_m(t)=\\sqrt{\\frac{2E}{T_s}}\\cos\\left[2\\pi(f_c+m\\Delta f)t\\right], \\quad 0 \\le t \\le T_s, \\quad m = 1, 2, \\dots, M
\\]

Where the minimum frequency separation for coherent detection is:

\\\\[
\\Delta f = \\frac{1}{2T_s}
\\\\]

Inline tests: Energy $E = mc^2$, standard LaTeX inline \\(E = mc^2\\), and double-escaped \\\\(F = ma\\\\).

## 2. Hadamard Transform Matrices

The recursive definition of Sylvester-Hadamard matrices is:

\\[
H_{n+1}=
\\begin{bmatrix}
H_n & H_n \\\\
H_n & -H_n
\\end{bmatrix}
\\]

For $n = 0$, $H_0 = [1]$, which yields:

\\[
H_1 = \\begin{bmatrix} 1 & 1 \\\\ 1 & -1 \\end{bmatrix}, \\quad
H_2 = \\begin{bmatrix} 1 & 1 & 1 & 1 \\\\ 1 & -1 & 1 & -1 \\\\ 1 & 1 & -1 & -1 \\\\ 1 & -1 & -1 & 1 \\end{bmatrix}
\\]

## 3. Multiline Align & Cases Environments

Maxwell's equations in differential form:

\\begin{aligned}
\\nabla \\cdot \\mathbf{E} &= \\frac{\\rho}{\\varepsilon_0} \\\\
\\nabla \\cdot \\mathbf{B} &= 0 \\\\
\\nabla \\times \\mathbf{E} &= -\\frac{\\partial \\mathbf{B}}{\\partial t} \\\\
\\nabla \\times \\mathbf{B} &= \\mu_0\\mathbf{J} + \\mu_0\\varepsilon_0\\frac{\\partial \\mathbf{E}}{\\partial t}
\\end{aligned}

Piecewise decision boundary:

\\begin{cases}
\\hat{m} = 1, & \\text{if } r > \\gamma_{\\text{th}} \\\\
\\hat{m} = 0, & \\text{otherwise}
\\end{cases}

Boxed result:
\\[
\\boxed{P_e = Q\\left(\\sqrt{\\frac{E_b}{N_0}}\\right)}
\\]
`;

  const mathRequest: ExportPdfRequest = {
    markdown: engineeringMarkdown,
    metadata: {
      title: 'Digital Communications Theory',
      subtitle: 'Orthogonal Signaling and Matrix Encoders',
      author: 'Dr. Jane Doe',
      date: '2026',
      abstract: 'A comprehensive study of M-ary frequency shift keying and recursive Walsh-Hadamard matrix transforms.',
    },
    settings: {
      ...DEFAULT_SETTINGS,
      preset: 'academic',
    },
  };

  const mathResult = await generatePdf(mathRequest);
  assert(Buffer.isBuffer(mathResult.buffer), 'Returned buffer is a valid Buffer');
  assert(mathResult.buffer.length > 5000, `Generated PDF buffer is non-empty (${mathResult.buffer.length} bytes)`);
  assert(mathResult.buffer.slice(0, 5).toString('ascii') === '%PDF-', 'PDF file contains valid %PDF- header magic bytes');
  assert(mathResult.typstSource.includes('mat('), 'Typst source contains converted Hadamard matrix mat(...)');
  assert(mathResult.typstSource.includes('sqrt('), 'Typst source contains square root conversion');

  // Test 3: All four document presets (Academic, Technical, Minimal, Research)
  console.log('\n--- Test 3: Document Presets Validation ---');
  const presets: DocumentPreset[] = ['academic', 'technical', 'minimal', 'research'];

  for (const preset of presets) {
    const presetReq: ExportPdfRequest = {
      markdown: `# ${preset.toUpperCase()} PRESET TEST\n\nTesting layout, typography, and page structure.\n\n\\[ \\int_{-\\infty}^\\infty e^{-x^2} dx = \\sqrt{\\pi} \\]`,
      metadata: {
        title: `${preset} Document`,
        author: 'Paperflow Test Suite',
      },
      settings: {
        ...DEFAULT_SETTINGS,
        preset,
        twoColumn: preset === 'research',
        includeToc: true,
      },
    };

    const res = await generatePdf(presetReq);
    assert(res.buffer.length > 3000, `Preset '${preset}' generates valid PDF (${res.buffer.length} bytes)`);
    assert(res.buffer.slice(0, 5).toString('ascii') === '%PDF-', `Preset '${preset}' PDF has valid header`);
  }

  // Test 4: Code block protection (LaTeX math inside code block remains literal)
  console.log('\n--- Test 4: Code Block Protection ---');
  const codeBlockMarkdown = `
# Code Block Test

Here is a Python code snippet with LaTeX-like comments:

\`\`\`python
# Compute carrier offset: \\[ \\Delta f = \\frac{k}{T_s} \\]
def compute_carrier(k, Ts):
    delta_f = k / Ts
    return delta_f
\`\`\`

And inline code: \`\\[ x \\]\` or \`$E = mc^2$\`.
`;

  const codeRes = await generatePdf({
    markdown: codeBlockMarkdown,
  });
  assert(codeRes.buffer.length > 2000, 'Code block document produces valid PDF');
  // Typst source should contain raw block with code, not equation
  assert(codeRes.typstSource.includes('compute_carrier'), 'Typst source preserves python code content');

  // Test 5: Comprehensive document features (Tables, Blockquotes, Lists, Multi-page)
  console.log('\n--- Test 5: Complex Multi-Page Document Features ---');
  const multiPageMd = `
# Engineering Specification & Benchmark Analysis

## System Performance Summary

| Architecture | Clock (GHz) | IPC | Power (W) | Efficiency (GFLOPS/W) |
| :--- | :---: | :---: | :---: | ---: |
| Alpha Core | 3.2 | 2.1 | 45 | 14.8 |
| Beta Vector | 2.8 | 3.4 | 65 | 22.1 |
| Gamma Neural | 1.9 | 5.8 | 35 | 38.4 |

> "Simplicity is prerequisite for reliability." — Edsger W. Dijkstra

### Key Observations
1. First numbered item with math: $\\alpha = 0.05$.
2. Second numbered item with vector: $\\mathbf{v} = [x, y, z]^T$.
   - Nested sub-item A.
   - Nested sub-item B.

${Array.from({ length: 8 }, (_, i) => `### Section ${i + 3}\n\nParagraph text demonstrating page breaks and continuous document flow across multiple pages in the generated PDF file.\n\n\\[ f_${i}(t) = \\sin(${i + 1}\\omega_0 t) \\]\n`).join('\n')}
`;

  const multiRes = await generatePdf({
    markdown: multiPageMd,
    settings: {
      ...DEFAULT_SETTINGS,
      preset: 'technical',
      numberedHeadings: true,
      includeToc: true,
    },
  });
  assert(multiRes.buffer.length > 25000, `Multi-page document generates rich PDF (${multiRes.buffer.length} bytes)`);

  // Test 6: Temporary directory cleanup validation
  console.log('\n--- Test 6: Temporary Directory Cleanup ---');
  const tmpDirBefore = os.tmpdir();
  const testReq: ExportPdfRequest = { markdown: '# Temp Cleanup Test\n\nContent' };
  await generatePdf(testReq);
  // Verify no lingering paperflow-* directories exist that are older than current run
  const lingeringDirs = fs.readdirSync(tmpDirBefore).filter((f) => f.startsWith('paperflow-'));
  assert(lingeringDirs.length === 0, 'Temporary directories are completely removed after PDF generation');

  // Test 7: Error handling without filesystem path leaks
  console.log('\n--- Test 7: Error Handling & Path Sanitization ---');
  let caughtError = false;
  try {
    // Malformed typst / syntax error trigger
    await generatePdf({
      markdown: 'Some markdown',
      settings: {
        ...DEFAULT_SETTINGS,
        fontSize: 'not-a-valid-size' as any,
      },
    });
  } catch (err: any) {
    caughtError = true;
    assert(!err.message.includes(os.tmpdir()), 'Error message does not leak internal os.tmpdir() path');
    assert(err.message.includes('PDF typesetting error'), 'Descriptive error message returned');
  }
  assert(caughtError, 'Invalid settings properly caught and rejected');

  // Test 8: Mathematical Regression Suite Fixture Across All Presets
  console.log('\n--- Test 8: Mathematical Regression Suite (>=3 pages, >=15 equations) ---');
  const regressionFixturePath = path.resolve(__dirname, '../../../tests/fixtures/mathematical-regression.md');
  assert(fs.existsSync(regressionFixturePath), 'Regression fixture tests/fixtures/mathematical-regression.md exists');
  const regressionMd = fs.readFileSync(regressionFixturePath, 'utf-8');

  for (const preset of presets) {
    const res = await generatePdf({
      markdown: regressionMd,
      metadata: {
        title: 'Mathematical Typesetting and Layout Regression Suite',
        subtitle: 'Evaluation of Native Vector Equations, Numbering, and Pagination',
        author: 'Paperflow Validation Team',
        date: 'November 2026',
        abstract: 'A rigorous verification benchmark for mathematical typesetting, equation numbering, and boundary pagination across academic, technical, minimal, and research presets.',
      },
      settings: {
        ...DEFAULT_SETTINGS,
        preset,
        twoColumn: preset === 'research',
        includeToc: true,
      },
    });

    assert(res.buffer.length > 50000, `Preset '${preset}' generated comprehensive PDF (${res.buffer.length} bytes)`);
    assert(res.typstSource.includes('$ { s_1'), `Preset '${preset}' correctly converted mathematical set into Typst $ { s_1 ... } $`);
    assert(res.typstSource.includes('compute_frequency_offset'), `Preset '${preset}' preserves fenced code blocks verbatim`);
    assert(res.typstSource.includes('#show box: it => {'), `Preset '${preset}' includes boxed equation numbering fix`);
  }

  // Test 9: Title Block Inclusion Option (includeTitle: true vs false)
  console.log('\n--- Test 9: Title Block Inclusion Option (includeTitle: true vs false) ---');
  const docWithTitleMd = '# First Section\n\nSome introductory content.\n';
  const metaWithTitle = {
    title: 'New Doc',
    date: 'November 2026',
    author: 'Author Name',
  };

  const pdfWithTitle = await generatePdf({
    markdown: docWithTitleMd,
    metadata: metaWithTitle,
    settings: {
      ...DEFAULT_SETTINGS,
      includeTitle: true,
    },
  });
  assert(pdfWithTitle.typstSource.includes('New Doc'), 'Generated Typst includes document title when includeTitle: true');
  assert(pdfWithTitle.typstSource.includes('November 2026'), 'Generated Typst includes date when includeTitle: true');

  const pdfWithoutTitle = await generatePdf({
    markdown: docWithTitleMd,
    metadata: metaWithTitle,
    settings: {
      ...DEFAULT_SETTINGS,
      includeTitle: false,
    },
  });
  assert(!pdfWithoutTitle.typstSource.includes('New Doc'), 'Generated Typst omits document title when includeTitle: false');
  assert(!pdfWithoutTitle.typstSource.includes('November 2026'), 'Generated Typst omits metadata date when includeTitle: false');

  // Test 10: Convolution Equation and Asterisk Multiplication LaTeX Normalization
  console.log('\n--- Test 10: Convolution Equation & Asterisk Multiplication Typesetting ---');
  assert(normalizeMathInner('y_j(t)=r(t)\\*h_j(t)') === 'y_j(t)=r(t)\\ast h_j(t)', 'normalizeMathInner converts \\* to \\ast when followed by letter');
  assert(normalizeMathInner('y_j(t)=r(t)*h_j(t)') === 'y_j(t)=r(t)*h_j(t)', 'normalizeMathInner preserves literal *');
  assert(normalizeMathInner('y_j(t)=r(t) \\* h_j(t)') === 'y_j(t)=r(t) \\ast h_j(t)', 'normalizeMathInner converts \\* to \\ast when surrounded by whitespace');
  assert(normalizeMathInner('r_j=\\int_0^T r(t)\\phi_j(t)\\\\,dt') === 'r_j=\\int_0^T r(t)\\phi_j(t)\\,dt', 'normalizeMathInner converts double-escaped thin space \\\\, to \\,');
  assert(normalizeMathInner('x\\\\;y\\\\:z\\\\!w') === 'x\\;y\\:z\\!w', 'normalizeMathInner converts double-escaped math spacing operators');

  const convolutionEquations = [
    { name: 'Double-backslash with asterisk', md: '\\[ y_j(t)=r(t)*h_j(t) \\]' },
    { name: 'Double-backslash with escaped asterisk', md: '\\[ y_j(t)=r(t)\\*h_j(t) \\]' },
    { name: 'Single-backslash with asterisk', md: '\\[ y_j(t)=r(t)*h_j(t) \\]' },
    { name: 'Single-backslash with escaped asterisk', md: '\\[ y_j(t)=r(t)\\*h_j(t) \\]' },
    { name: 'Double-dollar with escaped asterisk', md: '$$\ny_j(t)=r(t)\\*h_j(t)\n$$' },
    { name: 'Inline dollar with escaped asterisk', md: 'The convolution is $y_j(t)=r(t)\\*h_j(t)$.' },
    { name: 'Inline parentheses with escaped asterisk', md: 'The convolution is \\(y_j(t)=r(t)\\*h_j(t)\\).' },
    { name: 'Double-dollar correlator integral with \\\\,dt', md: '$$ r_j=\\int_0^T r(t)\\phi_j(t)\\\\,dt $$' },
  ];

  for (const { name, md } of convolutionEquations) {
    const convReq: ExportPdfRequest = {
      markdown: `# Signal Processing\n\nRemember the convolution equation:\n\n${md}\n`,
      metadata: {
        title: 'Matched Filter & Correlator Theory',
        author: 'Paperflow Test Suite',
      },
      settings: {
        ...DEFAULT_SETTINGS,
        preset: 'academic',
      },
    };

    const convRes = await generatePdf(convReq);
    assert(Buffer.isBuffer(convRes.buffer) && convRes.buffer.length > 5000, `${name}: Valid PDF generated (${convRes.buffer.length} bytes)`);
    assert(convRes.buffer.slice(0, 5).toString('ascii') === '%PDF-', `${name}: PDF contains valid %PDF- magic bytes`);
    if (name.includes('correlator integral')) {
      assert(convRes.typstSource.includes('integral_0^T') && convRes.typstSource.includes('phi.alt_j'), `${name}: Typst source contains properly converted integral`);
      assert(!convRes.typstSource.includes('\\$\\$ r\\_j'), `${name}: TeX math does not fall back to escaped text`);
    } else {
      assert(convRes.typstSource.includes('$ y_j (t) = r (t) \\* h_j (t) $') || convRes.typstSource.includes('$y_j (t) = r (t) \\* h_j (t)$'), `${name}: Typst source contains properly converted math equation`);
      assert(!convRes.typstSource.includes('\\$\\$ y\\_j'), `${name}: TeX math does not fall back to escaped text`);
    }
  }

  // Test 11: Escaped Comparison & Inequality Operators Normalization
  console.log('\n--- Test 11: Escaped Comparison & Inequality Operators Normalization ---');
  assert(normalizeMathInner('PM(r,s_1)\\<PM(r,s_2)') === 'PM(r,s_1)<PM(r,s_2)', 'normalizeMathInner converts \\< to <');
  assert(normalizeMathInner('PM(r,s_1)\\\\<PM(r,s_2)') === 'PM(r,s_1)<PM(r,s_2)', 'normalizeMathInner converts \\\\< to <');
  assert(normalizeMathInner('PM(r,s_1)\\>PM(r,s_2)') === 'PM(r,s_1)>PM(r,s_2)', 'normalizeMathInner converts \\> to >');
  assert(normalizeMathInner('a \\<= b') === 'a <= b', 'normalizeMathInner converts \\<= to <=');
  assert(normalizeMathInner('a \\>= b') === 'a >= b', 'normalizeMathInner converts \\>= to >=');

  const metricComparisonMd = `
# Probability Metric Decision Rules

The receiver compares these two metrics:

\\[ PM(r,s_1)=p\\,p(r\\mid s_1) \\]

\\[ PM(r,s_2)=(1-p)p(r\\mid s_2) \\]

The receiver compares these two metrics.

If:

\\[ PM(r,s_1)>PM(r,s_2) \\]

the receiver decides that \\(s_1\\) was transmitted.

If:

\\[ PM(r,s_1)\\<PM(r,s_2) \\]

the receiver decides that \\(s_2\\) was transmitted.

### 5. Probability metric ratio test

Your notes write:

\\[ \\boxed{ \\frac{PM(r,s_1)}{PM(r,s_2)} \\underset{s_2}{\\overset{s_1}{\\gtrless}}1 } \\]
`;

  const metricRes = await generatePdf({
    markdown: metricComparisonMd,
    settings: DEFAULT_SETTINGS,
  });

  assert(Buffer.isBuffer(metricRes.buffer) && metricRes.buffer.length > 5000, `Probability metric PDF generated successfully (${metricRes.buffer.length} bytes)`);
  assert(metricRes.buffer.slice(0, 5).toString('ascii') === '%PDF-', 'Probability metric PDF contains valid %PDF- magic bytes');
  assert(metricRes.typstSource.includes('$ P M (r , s_1) < P M (r , s_2) $') || metricRes.typstSource.includes('< P M (r'), 'Typst source contains properly converted less-than math equation');
  assert(!metricRes.typstSource.includes('\\<'), 'Typst source does not contain illegal \\< control sequence');
  assert(!metricRes.typstSource.includes('\\$\\$ PM(r,s\\_1)'), 'TeX math does not fall back to escaped text for less-than equation');

  console.log('\n======================================================');
  console.log(`Results: ${passedTests} / ${totalTests} assertions passed (${failedTests} failed)`);
  console.log('======================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
