import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Settings,
  Eye,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { DocumentMetadata, ExportSettings, DocumentPreset, PageSize, MarginSize } from '../types';
import { exportPdfApi } from '../services/api';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  markdown: string;
  metadata: DocumentMetadata;
  settings: ExportSettings;
  onUpdateSettings: (newSettings: ExportSettings) => void;
  wordCount: number;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  markdown,
  metadata,
  settings,
  onUpdateSettings,
  wordCount,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'configure' | 'preview'>('configure');

  // Clean up object URL when modal closes or new blob generated
  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const blob = await exportPdfApi({
        markdown,
        metadata,
        settings,
      });
      setPdfBlob(blob);
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setActiveTab('preview');
    } catch (err: any) {
      setError(err.message || 'Failed to generate PDF document.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!pdfBlob) return;
    const rawTitle = metadata.title || 'Paperflow_Document';
    const safeTitle = rawTitle.trim().replace(/[^a-zA-Z0-9_\-]/g, '_') || 'document';
    const filename = `${safeTitle}.pdf`;

    const a = document.createElement('a');
    a.href = pdfUrl!;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#faf9f6] dark:bg-[#141719] border border-gray-300 dark:border-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-gray-900 dark:text-gray-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex-none px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-amber-700 dark:bg-amber-600 flex items-center justify-center text-white">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Export Document to PDF</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Native vector typesetting with sharp LaTeX math and custom styling
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {pdfUrl && (
              <div className="flex bg-gray-200/80 dark:bg-gray-800 p-0.5 rounded text-xs">
                <button
                  onClick={() => setActiveTab('configure')}
                  className={`px-3 py-1 rounded transition-colors ${
                    activeTab === 'configure'
                      ? 'bg-white dark:bg-gray-900 font-medium shadow-sm'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Configure
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-3 py-1 rounded transition-colors ${
                    activeTab === 'preview'
                      ? 'bg-white dark:bg-gray-900 font-medium shadow-sm'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  PDF Viewer
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-1 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-6 p-4 rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-xs flex items-start space-x-3">
              <AlertCircle className="w-4 h-4 flex-none mt-0.5" />
              <div>
                <span className="font-semibold block mb-0.5">Generation Error:</span>
                <span className="font-mono">{error}</span>
              </div>
            </div>
          )}

          {activeTab === 'configure' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Left Column: Preset & Page Layout */}
              <div className="space-y-5">
                <div>
                  <label className="font-semibold block mb-2 text-gray-800 dark:text-gray-200">
                    Document Preset
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'academic', name: 'Academic Notes', desc: 'Serif, numbered equations, booktabs' },
                      { id: 'technical', name: 'Technical Docs', desc: 'Sans-serif, code callouts, numbered headings' },
                      { id: 'minimal', name: 'Minimal', desc: 'Understated, wide margins, clean' },
                      { id: 'research', name: 'Research Paper', desc: 'Formal publication, abstract, citations' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        onClick={() => onUpdateSettings({ ...settings, preset: p.id as DocumentPreset })}
                        className={`p-3 rounded border text-left transition-all ${
                          settings.preset === p.id
                            ? 'border-amber-600 bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 font-medium ring-1 ring-amber-600'
                            : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                        }`}
                      >
                        <div className="font-semibold text-xs">{p.name}</div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{p.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Page Geometry */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">
                      Page Size
                    </label>
                    <select
                      value={settings.pageSize}
                      onChange={(e) => onUpdateSettings({ ...settings, pageSize: e.target.value as PageSize })}
                      className="w-full p-2 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs outline-none"
                    >
                      <option value="a4">A4 (210×297mm)</option>
                      <option value="us-letter">US Letter (8.5×11in)</option>
                      <option value="a5">A5 (148×210mm)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">
                      Orientation
                    </label>
                    <select
                      value={settings.orientation}
                      onChange={(e) => onUpdateSettings({ ...settings, orientation: e.target.value as any })}
                      className="w-full p-2 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs outline-none"
                    >
                      <option value="portrait">Portrait</option>
                      <option value="landscape">Landscape</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">
                      Margins
                    </label>
                    <select
                      value={settings.margins}
                      onChange={(e) => onUpdateSettings({ ...settings, margins: e.target.value as MarginSize })}
                      className="w-full p-2 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs outline-none"
                    >
                      <option value="normal">Normal (2.5cm)</option>
                      <option value="compact">Compact (1.8cm)</option>
                      <option value="wide">Wide (3.2cm)</option>
                    </select>
                  </div>
                </div>

                {/* Typography Settings */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">
                      Font Size
                    </label>
                    <select
                      value={settings.fontSize}
                      onChange={(e) => onUpdateSettings({ ...settings, fontSize: e.target.value as any })}
                      className="w-full p-2 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs outline-none"
                    >
                      <option value="10pt">10 pt (Dense)</option>
                      <option value="11pt">11 pt (Standard)</option>
                      <option value="12pt">12 pt (Large)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold block mb-1.5 text-gray-700 dark:text-gray-300">
                      Line Spacing
                    </label>
                    <select
                      value={settings.lineSpacing}
                      onChange={(e) => onUpdateSettings({ ...settings, lineSpacing: parseFloat(e.target.value) })}
                      className="w-full p-2 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs outline-none"
                    >
                      <option value="1.2">1.2 (Compact)</option>
                      <option value="1.4">1.4 (Classic)</option>
                      <option value="1.6">1.6 (Generous)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Right Column: Document Structure & Toggles */}
              <div className="space-y-5">
                {/* Header & Footer Text */}
                <div className="space-y-3">
                  <div>
                    <label className="font-semibold block mb-1 text-gray-700 dark:text-gray-300">
                      Header Text (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Theoretical Physics Notes — Autumn 2026"
                      value={settings.headerText || ''}
                      onChange={(e) => onUpdateSettings({ ...settings, headerText: e.target.value })}
                      className="w-full p-2 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1 text-gray-700 dark:text-gray-300">
                      Footer Text (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Confidential — Draft Version"
                      value={settings.footerText || ''}
                      onChange={(e) => onUpdateSettings({ ...settings, footerText: e.target.value })}
                      className="w-full p-2 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-xs outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Structure Toggles */}
                <div className="space-y-2.5 pt-2">
                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.numberedHeadings}
                      onChange={(e) => onUpdateSettings({ ...settings, numberedHeadings: e.target.checked })}
                      className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                    />
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Numbered Headings (1.1, 1.2)
                    </span>
                  </label>

                  <label className="flex items-center space-x-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.includeToc}
                      onChange={(e) => onUpdateSettings({ ...settings, includeToc: e.target.checked })}
                      className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                    />
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Include Table of Contents (TOC)
                    </span>
                  </label>

                  {settings.preset === 'research' && (
                    <label className="flex items-center space-x-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.twoColumn}
                        onChange={(e) => onUpdateSettings({ ...settings, twoColumn: e.target.checked })}
                        className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Two-Column Scientific Layout
                      </span>
                    </label>
                  )}
                </div>

                {/* Document Summary Info */}
                <div className="p-3 bg-gray-100/70 dark:bg-gray-900/60 rounded border border-gray-200 dark:border-gray-800 text-[11px] text-gray-600 dark:text-gray-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Document Title:</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{metadata.title || 'Untitled'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Word Count:</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{wordCount} words</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Typesetting Engine:</span>
                    <span className="font-semibold text-amber-700 dark:text-amber-400">Pandoc + Typst (Native Vector Math)</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* PDF Preview View */
            <div className="w-full h-[600px] bg-gray-800 rounded flex flex-col overflow-hidden">
              {pdfUrl ? (
                <iframe
                  src={pdfUrl}
                  title="PDF Preview"
                  className="w-full h-full border-none"
                />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  No PDF generated yet.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="flex-none px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-[#f5f3ef]/50 dark:bg-[#111315]/50 flex items-center justify-between">
          <div>
            {pdfUrl && (
              <button
                onClick={() => window.open(pdfUrl, '_blank')}
                className="flex items-center space-x-1.5 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in New Tab</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>

            {pdfUrl ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="flex items-center space-x-1.5 px-3 py-2 border border-amber-600/60 dark:border-amber-500/60 rounded text-xs font-medium text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>Re-generate</span>
                </button>

                <button
                  onClick={handleDownload}
                  className="flex items-center space-x-2 px-5 py-2 bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white rounded text-xs font-medium transition-all shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex items-center space-x-2 px-5 py-2 bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 text-white rounded text-xs font-medium transition-all shadow-sm disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Typesetting PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Generate PDF</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
