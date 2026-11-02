import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modKey = isMac ? '⌘' : 'Ctrl';

  const shortcuts = [
    { key: `${modKey} + Enter`, desc: 'Export document to PDF' },
    { key: `${modKey} + S`, desc: 'Save document (auto-saved to local browser storage)' },
    { key: `${modKey} + O`, desc: 'Open / upload Markdown file' },
    { key: `${modKey} + Z`, desc: 'Undo editor changes' },
    { key: `${modKey} + Shift + Z`, desc: 'Redo editor changes' },
    { key: `${modKey} + F`, desc: 'Find and replace in editor' },
    { key: 'Tab', desc: 'Indent line / selection' },
    { key: 'Shift + Tab', desc: 'Outdent / unindent line' },
    { key: '$ ... $', desc: 'Inline LaTeX mathematical formula' },
    { key: '$$ ... $$', desc: 'Centered display mathematical formula' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-[#faf9f6] dark:bg-[#141719] border border-gray-300 dark:border-gray-800 rounded-lg shadow-2xl w-full max-w-[calc(100vw-1rem)] sm:max-w-md max-h-[92dvh] overflow-hidden text-gray-900 dark:text-gray-100 animate-in fade-in zoom-in-95 duration-150 text-xs flex flex-col">
        <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between flex-none">
          <div className="flex items-center space-x-2.5">
            <Keyboard className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-semibold">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close shortcuts"
            className="p-1.5 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-2.5 overflow-y-auto overscroll-contain flex-1">
          {shortcuts.map((sc, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-gray-800/60 last:border-none gap-2">
              <span className="text-gray-600 dark:text-gray-400">{sc.desc}</span>
              <kbd className="px-2 py-1 rounded bg-gray-200/80 dark:bg-gray-800 font-mono text-[11px] font-semibold text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700 flex-none">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="px-4 sm:px-5 py-3 border-t border-gray-200 dark:border-gray-800 bg-[#f5f3ef]/50 dark:bg-[#111315]/50 flex justify-end flex-none">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded text-xs font-medium transition-colors min-h-[38px] active:scale-95"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
