import React from 'react';
import { X, Sliders, ShieldCheck } from 'lucide-react';
import { DocumentMetadata } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: DocumentMetadata;
  onUpdateMetadata: (meta: DocumentMetadata) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  metadata,
  onUpdateMetadata,
}) => {
  if (!isOpen) return null;

  const handleChange = (field: keyof DocumentMetadata, value: string) => {
    onUpdateMetadata({
      ...metadata,
      [field]: value,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-[#faf9f6] dark:bg-[#141719] border border-gray-300 dark:border-gray-800 rounded-lg shadow-2xl w-full max-w-[calc(100vw-1rem)] sm:max-w-xl max-h-[92dvh] sm:max-h-[85vh] overflow-hidden text-gray-900 dark:text-gray-100 animate-in fade-in zoom-in-95 duration-150 text-xs flex flex-col">
        {/* Header */}
        <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between flex-none">
          <div className="flex items-center space-x-2.5">
            <Sliders className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-semibold">Document Metadata & Settings</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="p-1.5 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto overscroll-contain flex-1">
          <div>
            <label className="font-semibold block mb-1 text-gray-700 dark:text-gray-300">
              Document Title
            </label>
            <input
              type="text"
              value={metadata.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="e.g. Relativistic Quantum Mechanics"
              className="w-full p-2.5 sm:p-2 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 outline-none focus:border-amber-500 min-h-[38px]"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1 text-gray-700 dark:text-gray-300">
              Subtitle
            </label>
            <input
              type="text"
              value={metadata.subtitle}
              onChange={(e) => handleChange('subtitle', e.target.value)}
              placeholder="e.g. Advanced Lecture Notes — Volume I"
              className="w-full p-2.5 sm:p-2 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 outline-none focus:border-amber-500 min-h-[38px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1 text-gray-700 dark:text-gray-300">
                Author
              </label>
              <input
                type="text"
                value={metadata.author}
                onChange={(e) => handleChange('author', e.target.value)}
                placeholder="e.g. Dr. Julian S. Schwinger"
                className="w-full p-2.5 sm:p-2 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 outline-none focus:border-amber-500 min-h-[38px]"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1 text-gray-700 dark:text-gray-300">
                Date / Term
              </label>
              <input
                type="text"
                value={metadata.date}
                onChange={(e) => handleChange('date', e.target.value)}
                placeholder="e.g. November 2026"
                className="w-full p-2.5 sm:p-2 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 outline-none focus:border-amber-500 min-h-[38px]"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold block mb-1 text-gray-700 dark:text-gray-300">
              Abstract (Optional)
            </label>
            <textarea
              rows={3}
              value={metadata.abstract}
              onChange={(e) => handleChange('abstract', e.target.value)}
              placeholder="A brief summary of the paper or document..."
              className="w-full p-2.5 sm:p-2 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 outline-none focus:border-amber-500"
            />
          </div>

          {/* Privacy Note */}
          <div className="p-3.5 rounded bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 flex items-start space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-none mt-0.5" />
            <div className="text-[11px] text-emerald-900 dark:text-emerald-300 leading-relaxed">
              <span className="font-semibold block mb-0.5">Privacy First Guarantee</span>
              Your documents are kept exclusively in your browser's private local storage. No documents are stored in the cloud. PDF conversion is strictly ephemeral.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-5 py-3 border-t border-gray-200 dark:border-gray-800 bg-[#f5f3ef]/50 dark:bg-[#111315]/50 flex justify-end flex-none">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded text-xs font-medium transition-colors min-h-[38px] active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
