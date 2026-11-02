import { Router, Request, Response } from 'express';
import { generatePdf, DEFAULT_SETTINGS } from '../converters/pdfService.js';
import { ExportPdfRequest } from '../types.js';
import { checkBinaries } from '../utils/paths.js';

export const exportRouter = Router();

exportRouter.post('/pdf', async (req: Request, res: Response): Promise<void> => {
  try {
    const { markdown, metadata, settings, images } = req.body as ExportPdfRequest;

    if (!markdown || typeof markdown !== 'string') {
      res.status(400).json({ error: 'Markdown content is required and must be a string.' });
      return;
    }

    if (markdown.length > 5 * 1024 * 1024) {
      res.status(400).json({ error: 'Markdown content exceeds maximum allowable size (5MB).' });
      return;
    }

    const { buffer } = await generatePdf({
      markdown,
      metadata,
      settings,
      images,
    });

    const rawTitle = metadata?.title || 'Paperflow_Document';
    const safeTitle = rawTitle.trim().replace(/[^a-zA-Z0-9_\-]/g, '_') || 'document';
    const filename = `${safeTitle}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    res.status(200).send(buffer);
  } catch (error: any) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      error: 'PDF generation failed',
      details: error.message || 'An unexpected error occurred during document conversion.',
    });
  }
});

exportRouter.post('/typst', async (req: Request, res: Response): Promise<void> => {
  try {
    const { markdown, metadata, settings, images } = req.body as ExportPdfRequest;

    if (!markdown || typeof markdown !== 'string') {
      res.status(400).json({ error: 'Markdown content is required.' });
      return;
    }

    const { typstSource } = await generatePdf({
      markdown,
      metadata,
      settings,
      images,
    });

    res.json({ typstSource });
  } catch (error: any) {
    console.error('Error generating Typst source:', error);
    res.status(500).json({
      error: 'Typst code generation failed',
      details: error.message,
    });
  }
});

exportRouter.get('/presets', (_req: Request, res: Response) => {
  res.json({
    presets: [
      {
        id: 'academic',
        name: 'Academic Notes',
        description: 'Classic serif typography, numbered display equations, formal margins, and clean booktabs tables.',
        fontFamily: 'Source Serif 4',
        defaultPageSize: 'a4',
      },
      {
        id: 'technical',
        name: 'Technical Documentation',
        description: 'Modern sans-serif typography, structured numbered headings, syntax-highlighted code blocks, and running headers.',
        fontFamily: 'Inter',
        defaultPageSize: 'a4',
      },
      {
        id: 'minimal',
        name: 'Minimal',
        description: 'Austere editorial layout, generous whitespace, understated typography, and distraction-free presentation.',
        fontFamily: 'Newsreader',
        defaultPageSize: 'a4',
      },
      {
        id: 'research',
        name: 'Research Paper',
        description: 'Formal scientific publication style, numbered sections and equations, abstract block, and multi-column option.',
        fontFamily: 'Libertinus Serif',
        defaultPageSize: 'a4',
      },
    ],
    defaultSettings: DEFAULT_SETTINGS,
  });
});

exportRouter.get('/health', (_req: Request, res: Response) => {
  const binaryStatus = checkBinaries();
  res.json({
    status: binaryStatus.pandoc && binaryStatus.typst ? 'healthy' : 'degraded',
    pandoc: binaryStatus.pandoc,
    typst: binaryStatus.typst,
    pandocPath: binaryStatus.pandocPath,
    typstPath: binaryStatus.typstPath,
    timestamp: new Date().toISOString(),
  });
});
