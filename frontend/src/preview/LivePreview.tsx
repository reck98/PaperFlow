import React, { useMemo, useState } from 'react';
import { renderMarkdownWithMath } from './markdownRenderer';
import { DocumentMetadata, ExportSettings } from '../types';
import { ZoomIn, ZoomOut, RotateCcw, FileText } from 'lucide-react';

interface LivePreviewProps {
  markdown: string;
  metadata: DocumentMetadata;
  settings: ExportSettings;
}

export const LivePreview: React.FC<LivePreviewProps> = ({
  markdown,
  metadata,
  settings,
}) => {
  const [zoom, setZoom] = useState<number>(100);

  const htmlContent = useMemo(() => {
    return renderMarkdownWithMath(markdown);
  }, [markdown]);

  const presetClass = useMemo(() => {
    switch (settings.preset) {
      case 'academic':
        return 'preset-academic';
      case 'technical':
        return 'preset-technical';
      case 'minimal':
        return 'preset-minimal';
      case 'research':
        return 'preset-research';
      default:
        return 'preset-academic';
    }
  }, [settings.preset]);

  const marginPadding = useMemo(() => {
    switch (settings.margins) {
      case 'compact':
        return 'p-8 sm:p-12';
      case 'wide':
        return 'p-12 sm:p-20';
      case 'normal':
      default:
        return 'p-10 sm:p-16';
    }
  }, [settings.margins]);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 150));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 60));
  const handleResetZoom = () => setZoom(100);

  return (
    <div className="relative h-full flex flex-col bg-[#f0ede6] dark:bg-[#0a0c0d] overflow-hidden select-text">
      {/* Zoom Bar & Document Status */}
      <div className="flex-none flex items-center justify-between px-4 py-2 border-b border-[#e2dfd7] dark:border-[#212429] bg-[#f8f6f0]/80 dark:bg-[#121417]/80 backdrop-blur-sm z-10 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-2">
          <FileText className="w-3.5 h-3.5 text-amber-700 dark:text-amber-500" />
          <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">
            {settings.preset} Preset
          </span>
          <span className="text-gray-300 dark:text-gray-700">•</span>
          <span>{settings.pageSize.toUpperCase()}</span>
          <span className="text-gray-300 dark:text-gray-700">•</span>
          <span>{settings.fontSize}</span>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={handleZoomOut}
            title="Zoom out"
            className="p-1 rounded hover:bg-gray-200/60 dark:hover:bg-gray-800 transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="w-10 text-center font-mono font-medium">{zoom}%</span>
          <button
            onClick={handleZoomIn}
            title="Zoom in"
            className="p-1 rounded hover:bg-gray-200/60 dark:hover:bg-gray-800 transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetZoom}
            title="Reset zoom"
            className="p-1 rounded hover:bg-gray-200/60 dark:hover:bg-gray-800 transition-colors ml-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Document Sheet Canvas */}
      <div className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center items-start">
        <div
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out',
          }}
          className={`paper-sheet w-full max-w-[850px] min-h-[1100px] rounded-[2px] ${marginPadding} ${presetClass} relative my-2`}
        >
          {/* Document Header Text if configured */}
          {settings.headerText && (
            <div className="text-right text-[11px] text-gray-400 dark:text-gray-500 pb-4 mb-8 border-b border-gray-100 dark:border-gray-800 font-sans tracking-wide">
              {settings.headerText}
            </div>
          )}

          {/* Document Title Block */}
          {settings.includeTitle !== false && metadata.title && (
            <div className="mb-10 text-center border-b border-gray-100 dark:border-gray-800/80 pb-8">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-50 mb-3">
                {metadata.title}
              </h1>
              {metadata.subtitle && (
                <div className="text-lg text-gray-600 dark:text-gray-400 font-normal mb-3">
                  {metadata.subtitle}
                </div>
              )}
              {metadata.author && (
                <div className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-2">
                  {metadata.author}
                </div>
              )}
              {metadata.date && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {metadata.date}
                </div>
              )}
            </div>
          )}

          {/* Abstract Block */}
          {metadata.abstract && (
            <div className="max-w-[88%] mx-auto mb-10 p-4 bg-gray-50/70 dark:bg-gray-800/40 rounded border border-gray-200/70 dark:border-gray-800/60 text-center">
              <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 font-sans">
                Abstract
              </div>
              <p className="text-sm italic text-gray-700 dark:text-gray-300 leading-relaxed">
                {metadata.abstract}
              </p>
            </div>
          )}

          {/* Rendered Markdown Body with KaTeX */}
          <div
            className="prose dark:prose-invert max-w-none text-gray-900 dark:text-gray-100 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />

          {/* Document Footer */}
          {settings.pageNumbering !== 'none' && (
            <div className="mt-20 pt-6 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-[11px] text-gray-400 dark:text-gray-500 font-sans">
              <div>{settings.footerText || ''}</div>
              <div className="font-mono">1</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
