import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { exportRouter } from './routes/export.js';
import { checkBinaries } from './utils/paths.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// API routes
app.use('/api', exportRouter);

// Serve static frontend in production if built
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  console.log(`Serving static files from ${frontendDistPath}`);
  app.use(express.static(frontendDistPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message || 'An unexpected error occurred.',
  });
});

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`Paperflow Backend listening on http://localhost:${PORT}`);
  const binaries = checkBinaries();
  console.log(
    `Pandoc status:       ${
      binaries.pandoc ? `Available (${binaries.pandocPath} - ${binaries.pandocVersion || 'v?'})` : 'MISSING'
    }`
  );
  console.log(
    `Pandoc Typst writer: ${
      binaries.pandocSupportsTypst
        ? 'Supported (Native Typst export active)'
        : 'NOT SUPPORTED (Requires Pandoc >= 3.1.2)'
    }`
  );
  console.log(
    `Typst status:        ${
      binaries.typst ? `Available (${binaries.typstPath} - ${binaries.typstVersion || 'v?'})` : 'MISSING'
    }`
  );
  console.log(`===============================================`);

  if (!binaries.pandoc || !binaries.typst || !binaries.pandocSupportsTypst) {
    console.error(`\n[CRITICAL WARNING] Typesetting dependencies are incomplete:`);
    if (!binaries.pandoc) {
      console.error(`  - Pandoc CLI is not found or not executable at '${binaries.pandocPath}'.`);
    } else if (!binaries.pandocSupportsTypst) {
      console.error(
        `  - Installed Pandoc at '${binaries.pandocPath}' does NOT support the 'typst' writer. Please install Pandoc >= 3.1.2.`
      );
    }
    if (!binaries.typst) {
      console.error(`  - Typst CLI is not found or not executable at '${binaries.typstPath}'.`);
    }
    console.error(`PDF generation will fail until these dependencies are resolved.\n`);
  }
});
