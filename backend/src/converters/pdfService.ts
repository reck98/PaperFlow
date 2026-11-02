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

export const DEFAULT_SETTINGS: ExportSettings = {
  preset: 'academic',
  pageSize: 'a4',
  orientation: 'portrait',
  margins: 'normal',
  fontSize: '11pt',
  lineSpacing: 1.4,
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
    processedMarkdown = processedMarkdown.replace(/!\[([^\]]*)\]\(data:image\/([a-zA-Z]+);base64,([^)]+)\)/g, (match, alt, ext, b64) => {
      imgCounter++;
      const imgFileName = `embedded_img_${imgCounter}.${ext || 'png'}`;
      const imgFilePath = path.join(tempDir, imgFileName);
      fs.writeFileSync(imgFilePath, Buffer.from(b64, 'base64'));
      return `![${alt}](${imgFileName})`;
    });

    // Ensure standalone LaTeX math environments are wrapped in display math delimiters
    processedMarkdown = processedMarkdown.replace(
      /(?<!\$)\s*(\\begin\{(?:matrix|pmatrix|bmatrix|vmatrix|aligned|align|gather|cases)\}[\s\S]*?\\end\{(?:matrix|pmatrix|bmatrix|vmatrix|aligned|align|gather|cases)\})\s*(?!\$)/g,
      '\n\n$$\n$1\n$$\n\n'
    );

    const inputMdPath = path.join(tempDir, 'input.md');
    fs.writeFileSync(inputMdPath, processedMarkdown, 'utf-8');

    // 2. Convert Markdown to Typst body using Pandoc
    const bodyTypPath = path.join(tempDir, 'body.typ');
    const pandocArgs = [
      'input.md',
      '-f',
      'markdown+tex_math_dollars+tex_math_double_backslash+raw_tex+pipe_tables+grid_tables+fenced_code_blocks+backtick_code_blocks+auto_identifiers',
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
      console.error('Pandoc conversion failed:', err);
      throw new Error(`Markdown parsing error: ${err.stderr || err.message}`);
    }

    let bodyTypContent = fs.readFileSync(bodyTypPath, 'utf-8');

    // 3. Wrap with Typst styling template
    const { headerCode } = generateTypstWrapper(metadata, settings);
    const fullTypstSource = `${headerCode}\n\n// --- Document Body ---\n${bodyTypContent}\n`;

    const mainTypPath = path.join(tempDir, 'document.typ');
    fs.writeFileSync(mainTypPath, fullTypstSource, 'utf-8');

    // 4. Compile with Typst
    const outputPdfPath = path.join(tempDir, 'document.pdf');
    const typstArgs = ['compile', 'document.typ', 'document.pdf'];

    try {
      await execFileAsync(TYPST_BIN, typstArgs, {
        cwd: tempDir,
        timeout: 20000,
      });
    } catch (err: any) {
      console.error('Typst compilation failed:', err);
      throw new Error(`PDF typesetting error: ${err.stderr || err.message}`);
    }

    if (!fs.existsSync(outputPdfPath)) {
      throw new Error('PDF output file was not generated.');
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
