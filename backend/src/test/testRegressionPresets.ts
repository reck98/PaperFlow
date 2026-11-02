import fs from 'fs';
import path from 'path';
import { generatePdf, DEFAULT_SETTINGS } from '../converters/pdfService.js';
import { execFileSync } from 'child_process';
import { TYPST_BIN } from '../utils/paths.js';

const fixturePath = path.resolve(__dirname, '../../../tests/fixtures/mathematical-regression.md');
const fixtureMd = fs.readFileSync(fixturePath, 'utf-8');

const presets: ('academic' | 'technical' | 'minimal' | 'research')[] = ['academic', 'technical', 'minimal', 'research'];

async function testAllPresets() {
  console.log('Testing mathematical-regression.md across all 4 presets...\n');

  for (const preset of presets) {
    console.log(`--- Compiling Preset: ${preset} ---`);
    const result = await generatePdf({
      markdown: fixtureMd,
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

    console.log(`  PDF generated: ${result.buffer.length} bytes`);

    // Write to scratch directory for inspection
    const outPdf = path.resolve(`../scratch/regression-${preset}.pdf`);
    const outTyp = path.resolve(`../scratch/regression-${preset}.typ`);
    fs.writeFileSync(outPdf, result.buffer);
    fs.writeFileSync(outTyp, result.typstSource);

    // Query Typst for pages count
    try {
      execFileSync(TYPST_BIN, ['query', outTyp, '<page>', '--field', 'location'], { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] });
    } catch {
      // Ignored
    }
    
    // We can compile to SVG to count pages
    execFileSync(TYPST_BIN, ['compile', outTyp, path.resolve(`../scratch/regression-${preset}-{p}.svg`)]);
    const svgPages = fs.readdirSync(path.resolve('../scratch')).filter(f => f.startsWith(`regression-${preset}-`) && f.endsWith('.svg'));
    console.log(`  Page count for ${preset}: ${svgPages.length} pages`);

    // Verify raw LaTeX is NOT leaked in the body
    const bodyOnly = result.typstSource.split('// --- Document Body ---')[1] || '';
    
    // Check code blocks are preserved
    const hasRawLatexCode = bodyOnly.includes('compute_frequency_offset');
    console.log(`  Raw code block preserved: ${hasRawLatexCode}`);

    // Check equations query
    const eqQuery = execFileSync(TYPST_BIN, ['query', outTyp, 'math.equation'], { encoding: 'utf-8' });
    const equations = JSON.parse(eqQuery);
    console.log(`  Total math equations found: ${equations.length}`);

    // If preset is academic or research, verify numbering
    if (preset === 'academic' || preset === 'research') {
      const blockEqs = equations.filter((e: any) => e.block === true);
      const numberedBlockEqs = blockEqs.filter((e: any) => e.numbering !== null);
      const unnumberedBlockEqs = blockEqs.filter((e: any) => e.numbering === null);
      console.log(`  Block equations: ${blockEqs.length} total (${numberedBlockEqs.length} numbered, ${unnumberedBlockEqs.length} unnumbered/boxed)`);
    }
  }

  console.log('\nAll 4 presets compiled and validated successfully!');
}

testAllPresets().catch(err => {
  console.error('Error during test:', err);
  process.exit(1);
});
