export type DocumentPreset = 'academic' | 'technical' | 'minimal' | 'research';
export type PageSize = 'a4' | 'us-letter' | 'a5';
export type PageOrientation = 'portrait' | 'landscape';
export type MarginSize = 'compact' | 'normal' | 'wide';

export interface DocumentMetadata {
  title?: string;
  author?: string;
  subtitle?: string;
  date?: string;
  abstract?: string;
}

export interface ExportSettings {
  preset: DocumentPreset;
  pageSize: PageSize;
  orientation: PageOrientation;
  margins: MarginSize;
  fontSize: '10pt' | '11pt' | '12pt';
  lineSpacing: number;
  includeToc: boolean;
  tocDepth: number;
  numberedHeadings: boolean;
  pageNumbering: '1' | '1 / 1' | 'I' | 'none';
  headerText?: string;
  footerText?: string;
  fontFamily?: string;
  twoColumn?: boolean;
}

export interface ImageAttachment {
  filename: string;
  data: string; // Base64 encoded or data URL
}

export interface ExportPdfRequest {
  markdown: string;
  metadata?: DocumentMetadata;
  settings?: Partial<ExportSettings>;
  images?: ImageAttachment[];
}
