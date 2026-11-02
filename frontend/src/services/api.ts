import { DocumentMetadata, ExportSettings } from '../types';

export interface ExportPdfParams {
  markdown: string;
  metadata?: DocumentMetadata;
  settings?: ExportSettings;
  images?: { filename: string; data: string }[];
}

export async function exportPdfApi(params: ExportPdfParams): Promise<Blob> {
  const response = await fetch('/api/pdf', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    let errorMessage = `PDF generation failed (${response.status} ${response.statusText})`;
    try {
      const errData = await response.json();
      if (errData.details) {
        errorMessage = errData.details;
      } else if (errData.error) {
        errorMessage = errData.error;
      }
    } catch {}
    throw new Error(errorMessage);
  }

  return await response.blob();
}

export async function exportTypstApi(params: ExportPdfParams): Promise<string> {
  const response = await fetch('/api/typst', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.details || errData.error || 'Failed to generate Typst source.');
  }

  const data = await response.json();
  return data.typstSource;
}

export async function checkBackendHealth(): Promise<{ status: string; pandoc: boolean; typst: boolean }> {
  try {
    const response = await fetch('/api/health');
    if (!response.ok) throw new Error('Health check failed');
    return await response.json();
  } catch {
    return { status: 'offline', pandoc: false, typst: false };
  }
}
