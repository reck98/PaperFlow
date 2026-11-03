import fs from 'fs';
import path from 'path';
import os from 'os';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import { ExportPdfRequest, ExportSettings } from '../types.js';
import { PANDOC_BIN, TYPST_BIN } from '../utils/paths.js';
import { generateTypstWrapper } from '../presets/index.js';

const execFileAsync = promisify(execFile);

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
    // 7. Escaped comparison operators from Markdown (\+< or \+>): in LaTeX math, \< is undefined and \> is spacing
    .replace(/\\+([<>])/g, (_m, op) => op)
    // 8. Collapse internal blank lines which cause Pandoc's TeX math parser to abort
    .replace(/\r?\n\s*\r?\n/g, '\n');
}

export function preprocessMathForPandoc(markdown: string): string {
  // 1. Protect fenced code blocks (``` and ~~~) and inline code (`) so math regexes never touch code snippets
  const codeBlocks: { placeholder: string; original: string }[] = [];
  let processed = markdown.replace(/(```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]+`)/g, (match) => {
    const placeholder = `PAPERFLOWCODEBLOCK${codeBlocks.length}END`;
    codeBlocks.push({ placeholder, original: match });
    return placeholder;
  });

  // 2. Safe normalization of unambiguous double-escaped outer delimiters outside code blocks
  processed = processed.replace(/\\\\\[([\s\S]*?)\\\\\]/g, (_m, inner) => `\\[${normalizeMathInner(inner)}\\]`);
  processed = processed.replace(/\\\\\(([\s\S]*?)\\\\\)/g, (_m, inner) => `\\(${normalizeMathInner(inner)}\\)`);

  // 3. Normalize single-backslash display math \[ ... \]
  processed = processed.replace(/\\\[([\s\S]*?)\\\]/g, (_m, inner) => `\\[${normalizeMathInner(inner)}\\]`);

  // 4. Normalize double dollar display math $$ ... $$
  processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (_m, inner) => `$$${normalizeMathInner(inner)}$$`);

  // 5. Protect display math blocks before wrapping standalone environments
  const protectedMathBlocks: { placeholder: string; original: string }[] = [];
  processed = processed.replace(/(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\])/g, (match) => {
    const placeholder = `PAPERFLOWMATHBLOCK${protectedMathBlocks.length}END`;
    protectedMathBlocks.push({ placeholder, original: match });
    return placeholder;
  });

  // 6. Wrap standalone LaTeX environments in \[ ... \]
  processed = processed.replace(
    /(\\begin\{(?:matrix|pmatrix|bmatrix|Bmatrix|vmatrix|Vmatrix|aligned|alignedat|gathered|align\*?|gather\*?|cases|dcases|rcases|equation\*?)\}[\s\S]*?\\end\{(?:matrix|pmatrix|bmatrix|Bmatrix|vmatrix|Vmatrix|aligned|alignedat|gathered|align\*?|gather\*?|cases|dcases|rcases|equation\*?)\})/g,
    (_m, env) => `\n\n\\[\n${normalizeMathInner(env)}\n\\]\n\n`
  );

  // 7. Restore protected display math blocks
  for (const b of protectedMathBlocks) {
    processed = processed.replace(b.placeholder, () => b.original);
  }

  // 8. Normalize inline math \( ... \)
  processed = processed.replace(/\\\(([\s\S]*?)\\\)/g, (_m, inner) => `\\(${normalizeMathInner(inner)}\\)`);

  // 9. Normalize inline math $ ... $ (excluding $$)
  processed = processed.replace(/(?<!\$)\$(?!\$)([^\$\n]+?)(?<!\$)\$(?!\$)/g, (_m, inner) => `$${normalizeMathInner(inner)}$`);

  // 10. Restore protected code blocks using functional replacement to prevent $ interpretation
  for (const item of codeBlocks) {
    processed = processed.replace(item.placeholder, () => item.original);
  }

  return processed;
}

export const DEFAULT_SETTINGS: ExportSettings = {
  preset: 'academic',
  pageSize: 'a4',
  orientation: 'portrait',
  margins: 'normal',
  fontSize: '11pt',
  lineSpacing: 1.4,
  includeTitle: true,
  includeToc: false,
  tocDepth: 3,
  numberedHeadings: true,
  pageNumbering: '1',
  twoColumn: false,
};

export async function generatePdf(request: ExportPdfRequest): Promise<{ buffer: Buffer; typstSource: string }> {
  const tempDir = path.join(os.tmpdir(), `paperflow-${uuidv4()}`);
  fs.mkdirSync(tempDir, { recursive: true });

  try {
    const settings: ExportSettings = {
      ...DEFAULT_SETTINGS,
      ...(request.settings || {}),
    };
    const metadata = request.metadata || {};

    // 1. Process and save any image attachments
    let processedMarkdown = request.markdown || '';

    if (request.images && Array.isArray(request.images)) {
      for (const img of request.images) {
        if (!img.filename || !img.data) continue;
        const sanitizedName = path.basename(img.filename).replace(/[^a-zA-Z0-9._-]/g, '_');
        const imgPath = path.join(tempDir, sanitizedName);

        // Remove data URL prefix if present
        const base64Data = img.data.replace(/^data:image\/\w+;base64,/, '');
        fs.writeFileSync(imgPath, Buffer.from(base64Data, 'base64'));
      }
    }

    // Extract inline base64 images from markdown and write them to disk
    let imgCounter = 0;
    processedMarkdown = processedMarkdown.replace(/!\[([^\]]*)\]\(data:image\/([a-zA-Z]+);base64,([^)]+)\)/g, (_match, alt, ext, b64) => {
      imgCounter++;
      const imgFileName = `embedded_img_${imgCounter}.${ext || 'png'}`;
      const imgFilePath = path.join(tempDir, imgFileName);
      fs.writeFileSync(imgFilePath, Buffer.from(b64, 'base64'));
      return `![${alt}](${imgFileName})`;
    });

    // 2. Preprocess mathematical notation, escaping, delimiters, and environments
    processedMarkdown = preprocessMathForPandoc(processedMarkdown);

    const inputMdPath = path.join(tempDir, 'input.md');
    fs.writeFileSync(inputMdPath, processedMarkdown, 'utf-8');

    // 8. Convert Markdown to Typst body using Pandoc
    const bodyTypPath = path.join(tempDir, 'body.typ');
    const pandocArgs = [
      'input.md',
      '-f',
      'markdown+tex_math_dollars+tex_math_single_backslash+tex_math_double_backslash+raw_tex+pipe_tables+grid_tables+fenced_code_blocks+backtick_code_blocks+auto_identifiers',
      '-t',
      'typst',
      '-o',
      'body.typ',
    ];

    try {
      await execFileAsync(PANDOC_BIN, pandocArgs, {
        cwd: tempDir,
        timeout: 15000,
      });
    } catch (err: any) {
      const sanitizedErr = (err.stderr || err.message || '').replace(new RegExp(tempDir.replace(/\\/g, '\\\\'), 'g'), '[document]');
      console.error('Pandoc conversion failed:', sanitizedErr);
      throw new Error(`Markdown parsing error: ${sanitizedErr}`);
    }

    if (!fs.existsSync(bodyTypPath)) {
      throw new Error('Markdown parser did not generate intermediate Typst document.');
    }

    let bodyTypContent = fs.readFileSync(bodyTypPath, 'utf-8');

    // 9. Wrap with Typst styling template
    const { headerCode } = generateTypstWrapper(metadata, settings);
    const fullTypstSource = `${headerCode}\n\n// --- Document Body ---\n${bodyTypContent}\n`;

    const mainTypPath = path.join(tempDir, 'document.typ');
    fs.writeFileSync(mainTypPath, fullTypstSource, 'utf-8');

    // 10. Compile with Typst
    const outputPdfPath = path.join(tempDir, 'document.pdf');
    const typstArgs = ['compile', 'document.typ', 'document.pdf'];

    try {
      await execFileAsync(TYPST_BIN, typstArgs, {
        cwd: tempDir,
        timeout: 20000,
      });
    } catch (err: any) {
      const sanitizedErr = (err.stderr || err.message || '').replace(new RegExp(tempDir.replace(/\\/g, '\\\\'), 'g'), '[document]');
      console.error('Typst compilation failed:', sanitizedErr);
      throw new Error(`PDF typesetting error: ${sanitizedErr}`);
    }

    if (!fs.existsSync(outputPdfPath) || fs.statSync(outputPdfPath).size === 0) {
      throw new Error('PDF output file was not generated or is empty.');
    }

    const pdfBuffer = fs.readFileSync(outputPdfPath);
    return {
      buffer: pdfBuffer,
      typstSource: fullTypstSource,
    };
  } finally {
    // 5. Cleanup temporary directory safely
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (cleanupErr) {
      console.warn('Could not remove temporary directory:', tempDir, cleanupErr);
    }
  }
}
